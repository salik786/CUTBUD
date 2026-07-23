import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { visitId, faceShape, confidence, faceLength, jawline, forehead, hairType, hairDensity, hairThickness, hairline, hairTexture, hairDirection, hairVolume, recommendedStyles, avoidStyles } = body;

  if (!visitId || !faceShape) {
    return NextResponse.json({ error: "visitId and faceShape are required" }, { status: 400 });
  }

  const profile = await prisma.userHairProfile.upsert({
    where: { visitId },
    update: {
      faceShape,
      faceConfidence: confidence,
      faceLength,
      jawline,
      forehead,
      hairType,
      hairDensity,
      hairThickness,
      hairline,
      hairTexture,
      hairDirection,
      hairVolume,
      recommendedStyles: (recommendedStyles ?? []).join(","),
      avoidStyles: (avoidStyles ?? []).join(","),
    },
    create: {
      visitId,
      faceShape,
      faceConfidence: confidence,
      faceLength,
      jawline,
      forehead,
      hairType,
      hairDensity,
      hairThickness,
      hairline,
      hairTexture,
      hairDirection,
      hairVolume,
      recommendedStyles: (recommendedStyles ?? []).join(","),
      avoidStyles: (avoidStyles ?? []).join(","),
    },
  });

  return NextResponse.json({ profile });
}
