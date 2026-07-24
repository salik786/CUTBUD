import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

// Scanning a shop's entry QR code (or clicking a homepage CTA) used to land
// on a "Welcome — Get Started" screen requiring an extra tap before a visit
// existed. That screen added a step with no real choice on it, so this
// route now creates the visit and redirects straight into the product —
// recommendations by default, or the AI face-scan intake when linked with
// ?next=intake (used by the homepage's "AI Recommendation" CTA).
export default async function EntryLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { id } = await params;
  const { next } = await searchParams;
  const shop = await prisma.shop.findUnique({ where: { entryQrToken: id } });

  if (!shop || !shop.active) {
    return (
      <main className="hero-gradient flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-white">
        <h1 className="text-2xl font-bold">This code isn&apos;t working</h1>
        <p className="max-w-sm text-sm text-white/60">
          This QR code has expired or the shop isn&apos;t set up yet. Ask at the counter for a
          fresh code.
        </p>
      </main>
    );
  }

  const visit = await prisma.visit.create({
    data: { shopId: shop.id, deviceSessionToken: nanoid() },
  });

  redirect(next === "intake" ? `/v/${visit.id}/intake` : `/v/${visit.id}/recommendations`);
}
