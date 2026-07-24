import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const shops = await prisma.shop.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ shops });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, address } = await req.json();
  if (!name || !address) {
    return NextResponse.json({ error: "name and address are required" }, { status: 400 });
  }

  const shop = await prisma.shop.create({
    data: { name, address, entryQrToken: nanoid(10), exitQrToken: nanoid(10) },
  });
  return NextResponse.json({ shop });
}
