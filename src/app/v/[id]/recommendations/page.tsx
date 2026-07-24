import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/BackLink";
import { buildStyleWhere, buildStyleOrderBy } from "@/lib/styleFilters";
import { SearchBar } from "./SearchBar";
import { ViewSwitcher } from "./ViewSwitcher";

const PAGE_SIZE = 6;

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    faceShape?: string;
    filter?: string;
    q?: string;
    texture?: string;
    length?: string;
    maintenance?: string;
    premium?: string;
    sort?: string;
  }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { faceShape, filter, q, texture, length, maintenance, sort } = sp;
  const premium = sp.premium === "1";

  const orderBy = buildStyleOrderBy(sort);
  const matchedWhere = buildStyleWhere({ faceShape, filter, q, texture, length, maintenance, premium });

  // Independent queries — run in parallel instead of one after another to
  // cut the round-trip time in half. Only the first page loads server-side;
  // StyleGrid fetches subsequent pages on demand instead of preloading the
  // whole catalog.
  const [visit, matchedStyles, matchedTotal] = await Promise.all([
    prisma.visit.findUnique({ where: { id } }),
    prisma.styleCatalog.findMany({ where: matchedWhere, orderBy, take: PAGE_SIZE }),
    prisma.styleCatalog.count({ where: matchedWhere }),
  ]);
  if (!visit) notFound();

  // A face-shape filter that matched nothing shouldn't leave the grid empty
  // — the rest of the filters (if any) still apply to the fallback.
  let styles = matchedStyles;
  let total = matchedTotal;
  let matched = !!faceShape;
  if (faceShape && total === 0) {
    const fallbackWhere = buildStyleWhere({ filter, q, texture, length, maintenance, premium });
    [styles, total] = await Promise.all([
      prisma.styleCatalog.findMany({ where: fallbackWhere, orderBy, take: PAGE_SIZE }),
      prisma.styleCatalog.count({ where: fallbackWhere }),
    ]);
    matched = false;
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-5">
      <div className="flex items-center justify-between">
        {/* The shop entry route now creates a new visit and redirects on
            every load (no more "Get Started" screen to go back to), so
            "back" from here leaves the flow instead of looping into a
            fresh visit. */}
        <BackLink href="/" />
        <h1 className="fade-up text-lg font-bold tracking-tight">Discover Styles</h1>
        <span className="w-9" aria-hidden />
      </div>

      {/* AI analysis is opt-in, not forced on every visit — real per-user
          face/hair analysis is costly to run at scale, so it's offered here
          as a compact upgrade prompt rather than a mandatory first step. */}
      {!matched && (
        <Link
          href={`/v/${visit.id}/intake`}
          className="fade-up mt-3 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-light px-4 py-2.5 transition-colors hover:bg-accent-light/70"
          style={{ animationDelay: "60ms" }}
        >
          <p className="text-sm font-semibold text-accent">✨ AI Style Match</p>
          <p className="flex items-center gap-1 text-xs text-ink/60">
            Find styles that suit your face <span className="text-accent">→</span>
          </p>
        </Link>
      )}
      {matched && (
        <p className="fade-up mt-2 text-[13px] text-muted" style={{ animationDelay: "60ms" }}>
          Matched to your {faceShape} face shape
        </p>
      )}

      <div className="fade-up mt-3" style={{ animationDelay: "90ms" }}>
        <SearchBar />
      </div>

      {total === 0 ? (
        <p className="fade-up mt-10 text-center text-sm text-muted" style={{ animationDelay: "150ms" }}>
          No styles match{q ? ` “${q}”` : " that filter"}. Try a different search or filter.
        </p>
      ) : (
        <ViewSwitcher
          key={`${filter ?? ""}|${q ?? ""}|${texture ?? ""}|${length ?? ""}|${maintenance ?? ""}|${premium}|${sort ?? ""}|${matched}`}
          visitId={visit.id}
          initialStyles={styles}
          initialHasMore={PAGE_SIZE < total}
          faceShape={matched ? faceShape : undefined}
          filter={filter}
          q={q}
          texture={texture}
          length={length}
          maintenance={maintenance}
          premium={premium}
          sort={sort}
          pageSize={PAGE_SIZE}
        />
      )}

      <p className="fade-up mt-4 text-center text-xs text-muted" style={{ animationDelay: "180ms" }}>
        Tapping ♥ a style?{" "}
        <Link href={`/signup?visitId=${visit.id}`} className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>{" "}
        to save it for later.
      </p>
    </main>
  );
}
