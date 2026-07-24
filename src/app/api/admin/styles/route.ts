import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const styles = await prisma.styleCatalog.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ styles });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
  } = body;

  if (!name || !description || !basePrompt || !faceShapeFit) {
    return NextResponse.json(
      { error: "name, description, basePrompt, and faceShapeFit are required" },
      { status: 400 }
    );
  }

  const style = await prisma.styleCatalog.create({
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
    },
  });
  return NextResponse.json({ style });
}
