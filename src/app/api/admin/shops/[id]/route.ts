import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { name, address, active } = await req.json();
  const shop = await prisma.shop.update({ where: { id }, data: { name, address, active } });
  return NextResponse.json({ shop });
}
