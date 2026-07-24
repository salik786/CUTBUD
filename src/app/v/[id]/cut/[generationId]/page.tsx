import { notFound } from "next/navigation";
import type { StyleCatalog } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/Stepper";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BackLink } from "@/components/BackLink";
import { ShowToBarberButton } from "./ShowToBarberButton";

type Angle = "Front" | "Left" | "Right" | "Back";
const ANGLES: Angle[] = ["Front", "Left", "Right", "Back"];

function angleImage(style: StyleCatalog, angle: Angle): string | null {
  switch (angle) {
    case "Front":
      return style.imageUrl;
    case "Left":
      return style.leftImageUrl;
    case "Right":
      return style.rightImageUrl;
    case "Back":
      return style.backImageUrl;
  }
}

export default async function CutCardPage({
  params,
}: {
  params: Promise<{ id: string; generationId: string }>;
}) {
  const { id, generationId } = await params;

  const [visit, generation] = await Promise.all([
    prisma.visit.findUnique({ where: { id } }),
    prisma.styleGeneration.findUnique({
      where: { id: generationId },
      include: { styleCatalog: true },
    }),
  ]);
  if (!visit) notFound();
  if (!generation) notFound();

  const style = generation.styleCatalog;

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${visit.id}/recommendations`} />

      <div className="mt-4">
        <Stepper step={3} />
      </div>

      <div className="fade-up mt-8 flex items-start justify-between" style={{ animationDelay: "60ms" }}>
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight">{style.name}</h1>
          <p className="mt-0.5 text-[15px] text-muted">{style.fadeType}</p>
          {style.inspiredBy && (
            <p className="mt-1 text-xs text-muted">
              Inspired by <span className="font-medium text-ink/70">{style.inspiredBy}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-sm"
            aria-label="Share"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="var(--color-muted)" strokeWidth={1.8}>
              <path d="M8.5 10.5 15.5 7m-7 6 7 3.5M6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="fade-up mt-5" style={{ animationDelay: "100ms" }}>
        <PhotoPlaceholder
          src={style.imageUrl}
          label="Front reference"
          className="aspect-[4/3] w-full"
        />
      </div>

      <div className="fade-up mt-3 grid grid-cols-4 gap-2" style={{ animationDelay: "140ms" }}>
        {ANGLES.map((angle) => (
          <div key={angle} className="relative overflow-hidden rounded-xl">
            <PhotoPlaceholder src={angleImage(style, angle)} className="aspect-square w-full" />
            <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[9px] uppercase tracking-wide text-white">
              {angle}
            </span>
          </div>
        ))}
      </div>

      <div className="fade-up mt-6 rounded-2xl border border-border bg-surface p-4" style={{ animationDelay: "180ms" }}>
        <dl className="divide-y divide-border text-sm">
          <Row label="Fade" value={style.fadeType ?? "—"} />
          <Row label="Length (Top)" value={style.lengthMm ? `${style.lengthMm} mm` : "—"} />
          <Row label="Guard (Sides)" value={style.guardNumber ?? "—"} />
          <Row label="Style" value={style.name} />
          <Row label="Best For" value={style.faceShapeFit.split(",").join(", ")} />
        </dl>
      </div>

      <p className="fade-up mt-4 text-xs leading-relaxed text-muted" style={{ animationDelay: "220ms" }}>
        {generation.instructionText}
      </p>

      <div className="fade-up mt-6" style={{ animationDelay: "260ms" }}>
        <ShowToBarberButton visitId={visit.id} generationId={generation.id} />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular font-medium">{value}</dd>
    </div>
  );
}
