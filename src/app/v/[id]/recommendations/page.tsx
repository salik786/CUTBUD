import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Pill } from "@/components/Pill";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { BackLink } from "@/components/BackLink";
import { GenerateStyleLink } from "./GenerateStyleLink";

const FILTERS = ["All", "Trending", "Low Fade", "Curly", "Classic"];

export default async function RecommendationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ faceShape?: string }>;
}) {
  const { id } = await params;
  const { faceShape } = await searchParams;

  // Independent queries — run in parallel instead of one after another to
  // cut the round-trip time in half.
  const [visit, allStyles] = await Promise.all([
    prisma.visit.findUnique({ where: { id }, include: { shop: true } }),
    prisma.styleCatalog.findMany({ where: { active: true }, take: 6 }),
  ]);
  if (!visit) notFound();
  const matched = faceShape
    ? allStyles.filter((s) => s.faceShapeFit.toLowerCase().includes(faceShape.toLowerCase()))
    : [];
  const styles = matched.length > 0 ? matched : allStyles;

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${visit.shop.entryQrToken}`} />

      <h1 className="fade-up mt-6 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Recommended for You
      </h1>
      <p className="fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: "100ms" }}>
        {matched.length > 0
          ? `Matched to your ${faceShape} face shape`
          : "Popular styles, picked for a quick browse"}
      </p>

      {/* AI analysis is opt-in, not forced on every visit — real per-user
          face/hair analysis is costly to run at scale, so it's offered here
          as an upgrade rather than a mandatory first step. */}
      {matched.length === 0 && (
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

      <div
        className="fade-up mt-5 flex gap-2 overflow-x-auto pb-1"
        style={{ animationDelay: "160ms" }}
      >
        {FILTERS.map((f, i) => (
          <Pill key={f} label={f} active={i === 0} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {styles.map((style, i) => (
          <div
            key={style.id}
            className="fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-200 hover:shadow-lg"
            style={{ animationDelay: `${200 + i * 60}ms` }}
          >
            <GenerateStyleLink visitId={visit.id} styleCatalogId={style.id}>
              <PhotoPlaceholder src={style.imageUrl} className="aspect-square w-full rounded-none" />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{style.name}</p>
                <p className="text-xs text-muted">{style.fadeType ?? style.description}</p>
              </div>
            </GenerateStyleLink>
            <FavoriteButton className="absolute right-2 top-2" />
          </div>
        ))}
      </div>

      <div className="fade-up mt-6" style={{ animationDelay: `${200 + styles.length * 60 + 60}ms` }}>
        <SecondaryButton href={`/v/${visit.id}/recommendations`}>View More Styles</SecondaryButton>
      </div>

      <p
        className="fade-up mt-4 text-center text-xs text-muted"
        style={{ animationDelay: `${200 + styles.length * 60 + 100}ms` }}
      >
        Tapping ♥ a style?{" "}
        <Link href={`/signup?visitId=${visit.id}`} className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>{" "}
        to save it for later.
      </p>
    </main>
  );
}
