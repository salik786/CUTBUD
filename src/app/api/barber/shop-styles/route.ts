import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";

export async function POST(req: NextRequest) {
  const barber = await getBarberUser();
  if (!barber) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { styleCatalogId, available, skillLevel, price, durationMin, requiresAppointment } = await req.json();
  if (!styleCatalogId) {
    return NextResponse.json({ error: "styleCatalogId is required" }, { status: 400 });
  }

  const shopStyle = await prisma.shopStyle.upsert({
    where: { shopId_styleCatalogId: { shopId: barber.shopId, styleCatalogId } },
    create: {
      shopId: barber.shopId,
      styleCatalogId,
      available: !!available,
      skillLevel: skillLevel || null,
      price: price || null,
      durationMin: durationMin ? Number(durationMin) : null,
      requiresAppointment: !!requiresAppointment,
    },
    update: {
      available: !!available,
      skillLevel: skillLevel || null,
      price: price || null,
      durationMin: durationMin ? Number(durationMin) : null,
      requiresAppointment: !!requiresAppointment,
    },
  });

  return NextResponse.json({ shopStyle });
}
