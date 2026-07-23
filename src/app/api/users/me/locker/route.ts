import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ savedCuts: [] });

  const savedCuts = await prisma.savedCut.findMany({
    where: { userId: user.id },
    include: { styleGeneration: { include: { styleCatalog: true } }, shop: true },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json({ savedCuts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { styleGenerationId, shopId, note } = await req.json();
  if (!styleGenerationId) {
    return NextResponse.json({ error: "styleGenerationId is required" }, { status: 400 });
  }

  const savedCut = await prisma.savedCut.create({
    data: { userId: user.id, styleGenerationId, shopId, note },
  });

  return NextResponse.json({ savedCut });
}
