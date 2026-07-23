import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/Stepper";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.visit.findUnique({ where: { id }, include: { shop: true } });
  if (!visit) notFound();

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 py-8">
      <BackLink href={`/v/${visit.shop.entryQrToken}`} />

      <div className="mt-4">
        <Stepper step={1} />
      </div>

      <div className="fade-up mt-10 flex justify-center" style={{ animationDelay: "60ms" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-3xl">
          ✨
        </div>
      </div>

      <h1
        className="fade-up mt-5 text-center text-[1.75rem] font-bold tracking-tight"
        style={{ animationDelay: "100ms" }}
      >
        AI Hair Analysis
      </h1>
      <p className="fade-up mt-2 text-center text-[15px] leading-relaxed text-muted" style={{ animationDelay: "140ms" }}>
        We&apos;ll scan your face and hair, then recommend styles matched to your features —
        takes about 15 seconds.
      </p>

      <div className="fade-up mt-8 flex flex-col gap-3" style={{ animationDelay: "180ms" }}>
        {[
          "Position your face in frame — camera or upload",
          "AI analyzes your face shape and hair",
          "Get styles matched to what actually suits you",
        ].map((step, i) => (
          <div key={step} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
              {i + 1}
            </span>
            <p className="text-sm text-ink/80">{step}</p>
          </div>
        ))}
      </div>

      <div className="fade-up mt-8" style={{ animationDelay: "260ms" }}>
        <PrimaryButton href={`/v/${visit.id}/scan`}>Start Hair Analysis</PrimaryButton>
      </div>

      <p className="fade-up mt-5 text-center text-xs leading-relaxed text-muted" style={{ animationDelay: "300ms" }}>
        Your photo is analyzed on this device and is never uploaded or stored.
      </p>
    </main>
  );
}
