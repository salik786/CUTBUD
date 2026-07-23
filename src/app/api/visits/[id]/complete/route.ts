import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.visit.update({
    where: { id },
    data: { completedAt: new Date() },
  });
  return NextResponse.json({ visit });
}
