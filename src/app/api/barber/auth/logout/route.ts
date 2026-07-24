import { NextResponse } from "next/server";
import { destroyBarberSession } from "@/lib/barberAuth";

export async function POST() {
  await destroyBarberSession();
  return NextResponse.json({ ok: true });
}
