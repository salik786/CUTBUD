import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/BackLink";
import { buildStyleWhere } from "@/lib/styleFilters";
import { FilterBar } from "./FilterBar";
import { ViewSwitcher } from "./ViewSwitcher";

const PAGE_SIZE = 6;

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ faceShape?: string; filter?: string; q?: string }>;
}) {
  const { id } = await params;
  const { faceShape, filter, q } = await searchParams;

  const matchedWhere = buildStyleWhere({ faceShape, filter, q });

  // Independent queries — run in parallel instead of one after another to
  // cut the round-trip time in half. Only the first page loads server-side;
  // StyleGrid fetches subsequent pages on demand instead of preloading the
  // whole catalog.
  const [visit, matchedStyles, matchedTotal] = await Promise.all([
    prisma.visit.findUnique({ where: { id }, include: { shop: true } }),
    prisma.styleCatalog.findMany({ where: matchedWhere, take: PAGE_SIZE, orderBy: { name: "asc" } }),
    prisma.styleCatalog.count({ where: matchedWhere }),
  ]);
  if (!visit) notFound();

  // A face-shape filter that matched nothing shouldn't leave the grid empty
  // — the pill/search filter (if any) still applies to the fallback.
  let styles = matchedStyles;
  let total = matchedTotal;
  let matched = !!faceShape;
  if (faceShape && total === 0) {
    const fallbackWhere = buildStyleWhere({ filter, q });
    [styles, total] = await Promise.all([
      prisma.styleCatalog.findMany({ where: fallbackWhere, take: PAGE_SIZE, orderBy: { name: "asc" } }),
      prisma.styleCatalog.count({ where: fallbackWhere }),
    ]);
    matched = false;
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${visit.shop.entryQrToken}`} />

      <h1 className="fade-up mt-6 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Recommended for You
      </h1>
      <p className="fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: "100ms" }}>
        {matched ? `Matched to your ${faceShape} face shape` : "Popular styles, picked for a quick browse"}
      </p>

      {/* AI analysis is opt-in, not forced on every visit — real per-user
          face/hair analysis is costly to run at scale, so it's offered here
          as an upgrade rather than a mandatory first step. */}
      {!matched && (
        <Link
          href={`/v/${visit.id}/intake`}
          className="fade-up mt-5 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-light px-4 py-3.5 transition-colors hover:bg-accent-light/70"
          style={{ animationDelay: "130ms" }}
        >
          <div>
            <p className="text-sm font-semibold text-accent">✨ Get AI Recommendations</p>
            <p className="mt-0.5 text-xs text-ink/60">Scan your face for styles matched to you</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
      )}

      <FilterBar />

      {total === 0 ? (
        <p className="fade-up mt-10 text-center text-sm text-muted" style={{ animationDelay: "200ms" }}>
          No styles match{q ? ` “${q}”` : " that filter"}. Try a different search or filter.
        </p>
      ) : (
        <ViewSwitcher
          key={`${filter ?? ""}|${q ?? ""}|${matched}`}
          visitId={visit.id}
          initialStyles={styles}
          initialHasMore={PAGE_SIZE < total}
          faceShape={matched ? faceShape : undefined}
          filter={filter}
          q={q}
          pageSize={PAGE_SIZE}
        />
      )}

      <p className="fade-up mt-4 text-center text-xs text-muted" style={{ animationDelay: "260ms" }}>
        Tapping ♥ a style?{" "}
        <Link href={`/signup?visitId=${visit.id}`} className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>{" "}
        to save it for later.
      </p>
    </main>
  );
}
