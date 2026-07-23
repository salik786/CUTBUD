import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HairAnalysisFlow } from "./HairAnalysisFlow";

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) notFound();

  return <HairAnalysisFlow visitId={visit.id} />;
}
