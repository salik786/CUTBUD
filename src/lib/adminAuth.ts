import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(adminUserId: string) {
  const session = await prisma.adminSession.create({
    data: { adminUserId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  const store = await cookies();
  store.set(COOKIE_NAME, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.adminSession.delete({ where: { id: sessionId } }).catch(() => null);
  }
  store.delete(COOKIE_NAME);
}

/** Server-component-safe: returns the logged-in admin, or null. Never throws. */
export async function getAdminUser() {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({
    where: { id: sessionId },
    include: { adminUser: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.adminUser;
}
