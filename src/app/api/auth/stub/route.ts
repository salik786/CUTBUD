import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME } from "@/lib/session";

/**
 * Stands in for real Google/Apple OAuth and phone-OTP verification, which
 * need live provider credentials. Creates a lightweight user session so the
 * account-creation → save-to-locker flow is fully clickable end to end.
 * Swap for real Supabase Auth in Phase 3.
 */
export async function POST(req: NextRequest) {
  const { provider } = await req.json();

  const user = await prisma.user.create({
    data: {
      oauthProvider: provider ?? "email",
      oauthId: nanoid(),
    },
  });

  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
