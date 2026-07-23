import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/Stepper";
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
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) notFound();

  const allStyles = await prisma.styleCatalog.findMany({ where: { active: true }, take: 6 });
  const matched = faceShape
    ? allStyles.filter((s) => s.faceShapeFit.toLowerCase().includes(faceShape.toLowerCase()))
    : [];
  const styles = matched.length > 0 ? matched : allStyles;

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${visit.id}/intake`} />

      <div className="mt-4">
        <Stepper step={2} />
      </div>

      <h1 className="fade-up mt-8 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Recommended for You
      </h1>
      <p className="fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: "100ms" }}>
        {matched.length > 0
          ? `Matched to your ${faceShape} face shape`
          : "Based on your face shape and hair type"}
      </p>

      <div
        className="fade-up mt-5 flex gap-2 overflow-x-auto pb-1"
        style={{ animationDelay: "140ms" }}
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
            style={{ animationDelay: `${180 + i * 60}ms` }}
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

      <div className="fade-up mt-6" style={{ animationDelay: `${180 + styles.length * 60 + 60}ms` }}>
        <SecondaryButton href={`/v/${visit.id}/recommendations`}>View More Styles</SecondaryButton>
      </div>
    </main>
  );
}
