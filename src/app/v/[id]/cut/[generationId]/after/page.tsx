import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/Stepper";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StarRating } from "@/components/StarRating";
import { BackLink } from "@/components/BackLink";

export default async function BeforeAfterPage({
  params,
}: {
  params: Promise<{ id: string; generationId: string }>;
}) {
  const { id, generationId } = await params;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) notFound();

  const styles = await prisma.styleCatalog.findMany({
    where: { active: true, imageUrl: { not: null } },
    take: 2,
  });

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${id}/cut/${generationId}`} />

      <div className="mt-4">
        <Stepper step={4} />
      </div>

      <h1 className="fade-up mt-8 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Before &amp; After
      </h1>
      <p className="fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: "100ms" }}>
        Help your barber and community by sharing
      </p>

      <div className="fade-up mt-6 grid grid-cols-2 gap-3" style={{ animationDelay: "140ms" }}>
        <div className="relative overflow-hidden rounded-2xl">
          <PhotoPlaceholder src={styles[0]?.imageUrl} className="aspect-square w-full grayscale" />
          <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white">
            Before (sample)
          </span>
        </div>
        <div className="relative overflow-hidden rounded-2xl">
          <PhotoPlaceholder src={styles[1]?.imageUrl ?? styles[0]?.imageUrl} className="aspect-square w-full" />
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] uppercase tracking-wide text-white">
            After (sample)
          </span>
        </div>
      </div>

      <div className="fade-up mt-7" style={{ animationDelay: "180ms" }}>
        <p className="text-sm font-semibold">How was your experience?</p>
        <div className="mt-2">
          <StarRating name="experience" />
        </div>
      </div>

      <p className="fade-up mt-6 text-xs font-semibold text-muted" style={{ animationDelay: "220ms" }}>
        Add a note (optional)
      </p>
      <textarea
        className="fade-up mt-2 min-h-20 rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-accent"
        placeholder="Write your feedback…"
        style={{ animationDelay: "220ms" }}
      />

      <div className="fade-up mt-7" style={{ animationDelay: "260ms" }}>
        <PrimaryButton href={`/v/${visit.id}/rate`}>Continue</PrimaryButton>
      </div>
    </main>
  );
}
