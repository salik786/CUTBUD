import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";

export async function PATCH(req: NextRequest) {
  const barber = await getBarberUser();
  if (!barber) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const {
    name,
    address,
    description,
    logoUrl,
    coverImageUrl,
    phone,
    whatsapp,
    instagram,
    facebook,
    website,
    openingHours,
  } = await req.json();

  if (!name || !address) {
    return NextResponse.json({ error: "name and address are required" }, { status: 400 });
  }

  // Scoped to the barber's own shop only — shopId comes from the session,
  // never from the request body, so one barber can't edit another's shop.
  const shop = await prisma.shop.update({
    where: { id: barber.shopId },
    data: {
      name,
      address,
      description,
      logoUrl,
      coverImageUrl,
      phone,
      whatsapp,
      instagram,
      facebook,
      website,
      openingHours,
    },
  });

  return NextResponse.json({ shop });
}
