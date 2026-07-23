import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Phase 1/2 placeholder: creates a generation row with placeholder image URLs
 * and the style's base prompt as instruction text. Swap the image URLs for
 * real output once the image-generation pipeline (Section 6.5 of the spec)
 * is wired up — nothing else about this shape needs to change.
 */
export async function POST(req: NextRequest) {
  const { visitId, styleCatalogId } = await req.json();

  if (!visitId || !styleCatalogId) {
    return NextResponse.json({ error: "visitId and styleCatalogId are required" }, { status: 400 });
  }

  const style = await prisma.styleCatalog.findUnique({ where: { id: styleCatalogId } });
  if (!style) {
    return NextResponse.json({ error: "Style not found" }, { status: 404 });
  }

  const generation = await prisma.styleGeneration.create({
    data: {
      visitId,
      styleCatalogId,
      frontImageUrl: "pending",
      sideImageUrl: "pending",
      backImageUrl: "pending",
      instructionText: `${style.basePrompt}.`,
    },
  });

  await prisma.visit.update({
    where: { id: visitId },
    data: { selectedGenerationId: generation.id },
  });

  return NextResponse.json({ generation });
}
