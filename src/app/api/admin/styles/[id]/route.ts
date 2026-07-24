import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    name,
    description,
    basePrompt,
    faceShapeFit,
    guardNumber,
    lengthMm,
    fadeType,
    category,
    textureCompat,
    density,
    lengthCategory,
    maintenance,
    beardPairing,
    occasion,
    targetAudience,
    imageUrl,
    leftImageUrl,
    rightImageUrl,
    backImageUrl,
    displayAngle,
    inspiredBy,
    active,
  } = body;

  const style = await prisma.styleCatalog.update({
    where: { id },
    data: {
      name,
      description,
      basePrompt,
      faceShapeFit,
      guardNumber,
      lengthMm,
      fadeType,
      category,
      textureCompat,
      density,
      lengthCategory,
      maintenance,
      beardPairing,
      occasion,
      targetAudience,
      imageUrl,
      leftImageUrl,
      rightImageUrl,
      backImageUrl,
      displayAngle: displayAngle || "front",
      inspiredBy,
      active,
    },
  });
  return NextResponse.json({ style });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.styleCatalog.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // Most likely a foreign-key constraint — this style already has
    // generated cut cards referencing it. Deactivating (hides it from new
    // recommendations without breaking existing history) is the right move
    // instead of a hard delete here.
    return NextResponse.json(
      { error: "This style has already been used in cut cards and can't be deleted. Try deactivating it instead." },
      { status: 409 }
    );
  }
}
