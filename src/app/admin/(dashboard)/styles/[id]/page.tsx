import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StyleForm, styleToFormValues } from "../StyleForm";

export default async function EditStylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const style = await prisma.styleCatalog.findUnique({ where: { id } });
  if (!style) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Edit Style</h1>
      <StyleForm initial={styleToFormValues(style)} />
    </div>
  );
}
