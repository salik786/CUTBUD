import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/Stepper";
import { BackLink } from "@/components/BackLink";
import { RateForm } from "./RateForm";

export default async function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) notFound();

  const backHref = visit.selectedGenerationId
    ? `/v/${id}/cut/${visit.selectedGenerationId}/after`
    : `/v/${id}/recommendations`;

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 py-8">
      <BackLink href={backHref} />

      <div className="mt-4">
        <Stepper step={4} />
      </div>

      <h1 className="fade-up mt-8 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Rate Your Experience
      </h1>
      <p className="fade-up mt-1 text-[15px] text-muted" style={{ animationDelay: "100ms" }}>
        Your feedback helps others and your barber
      </p>

      <RateForm visitId={visit.id} shopId={visit.shopId} />
    </main>
  );
}
