import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createBarberSession } from "@/lib/barberAuth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const barber = await prisma.barberUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Same generic message whether the email doesn't exist or the password is
  // wrong — don't let this endpoint be used to enumerate barber emails.
  if (!barber || !(await verifyPassword(password, barber.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  await createBarberSession(barber.id);
  return NextResponse.json({ ok: true });
}
