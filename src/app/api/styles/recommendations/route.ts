import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const faceShape = req.nextUrl.searchParams.get("faceShape");

  const all = await prisma.styleCatalog.findMany({ where: { active: true } });

  const matched = faceShape
    ? all.filter((s) => s.faceShapeFit.split(",").includes(faceShape))
    : [];

  const styles = (matched.length > 0 ? matched : all).slice(0, 5);

  return NextResponse.json({ styles, matched: matched.length > 0 });
}
