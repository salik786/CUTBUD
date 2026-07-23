import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { visitId, shopId, stars, comment } = await req.json();

  if (!visitId || !shopId || !stars) {
    return NextResponse.json({ error: "visitId, shopId and stars are required" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: { visitId },
    update: { stars, comment },
    create: { visitId, shopId, stars, comment },
  });

  await prisma.visit.update({ where: { id: visitId }, data: { ratedAt: new Date() } });

  return NextResponse.json({ rating });
}
