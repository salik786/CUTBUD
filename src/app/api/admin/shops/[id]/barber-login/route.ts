import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/barberAuth";

// Unambiguous alphabet (no 0/O/1/l/I) — this password gets read aloud or
// typed off a handwritten note by a barber standing at the counter.
const generatePassword = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

// Create or reset the one login a shop gets. Always returns the plaintext
// password — it's only ever visible this once, right after admin action.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: shopId } = await params;
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const email = (body.email || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const emailTaken = await prisma.barberUser.findFirst({
    where: { email, shopId: { not: shopId } },
  });
  if (emailTaken) {
    return NextResponse.json({ error: "That email is already used by another shop's login" }, { status: 409 });
  }

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const barberUser = await prisma.barberUser.upsert({
    where: { shopId },
    create: { shopId, email, passwordHash },
    update: { email, passwordHash },
  });

  return NextResponse.json({ email: barberUser.email, password });
}
