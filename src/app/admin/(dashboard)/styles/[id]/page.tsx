import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StyleForm } from "../StyleForm";

export default async function EditStylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const style = await prisma.styleCatalog.findUnique({ where: { id } });
  if (!style) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Edit Style</h1>
      <StyleForm
        initial={{
          id: style.id,
          name: style.name,
          description: style.description,
          basePrompt: style.basePrompt,
          faceShapeFit: style.faceShapeFit,
          guardNumber: style.guardNumber ?? "",
          lengthMm: style.lengthMm ?? "",
          fadeType: style.fadeType ?? "",
          imageUrl: style.imageUrl ?? "",
          leftImageUrl: style.leftImageUrl ?? "",
          rightImageUrl: style.rightImageUrl ?? "",
          backImageUrl: style.backImageUrl ?? "",
          inspiredBy: style.inspiredBy ?? "",
          active: style.active,
        }}
      />
    </div>
  );
}
