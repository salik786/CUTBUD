import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createAdminSession } from "@/lib/adminAuth";

/**
 * Bootstrap-only: creates the very first admin account. Once any admin
 * exists, this endpoint refuses — there is deliberately no open "create an
 * admin" endpoint reachable by an unauthenticated request. Adding more
 * admins later needs a small follow-up (an authenticated "invite admin"
 * action), which isn't built yet — see DESIGN.md.
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const existingCount = await prisma.adminUser.count();
  if (existingCount > 0) {
    return NextResponse.json(
      { error: "An admin account already exists. Ask an existing admin to sign in." },
      { status: 403 }
    );
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: { email: email.toLowerCase().trim(), passwordHash },
  });

  await createAdminSession(admin.id);

  return NextResponse.json({ ok: true });
}
