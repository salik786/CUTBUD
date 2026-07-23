import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { entryQrToken } = await req.json();

  if (!entryQrToken) {
    return NextResponse.json({ error: "entryQrToken is required" }, { status: 400 });
  }

  const shop = await prisma.shop.findUnique({ where: { entryQrToken } });
  if (!shop || !shop.active) {
    return NextResponse.json({ error: "Shop not found or inactive" }, { status: 404 });
  }

  const visit = await prisma.visit.create({
    data: {
      shopId: shop.id,
      deviceSessionToken: nanoid(),
    },
  });

  return NextResponse.json({ visit, shop });
}
