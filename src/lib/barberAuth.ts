import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/adminAuth";

// Separate cookie/session from admin_session — a barber logging in must
// never end up with platform-admin access, and vice versa.
const COOKIE_NAME = "barber_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — barbers check in less often than you'd expect

export { hashPassword, verifyPassword };

export async function createBarberSession(barberUserId: string) {
  const session = await prisma.barberSession.create({
    data: { barberUserId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
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

export async function destroyBarberSession() {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.barberSession.delete({ where: { id: sessionId } }).catch(() => null);
  }
  store.delete(COOKIE_NAME);
}

/** Server-component-safe: returns the logged-in barber (with their shop), or null. Never throws. */
export async function getBarberUser() {
  const store = await cookies();
  const sessionId = store.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.barberSession.findUnique({
    where: { id: sessionId },
    include: { barberUser: { include: { shop: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.barberUser;
}
