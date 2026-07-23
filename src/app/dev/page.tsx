import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DevPage() {
  const shops = await prisma.shop.findMany({ where: { active: true } });

  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-10">
      <h1 className="text-xl font-bold">CutBuddy — dev entry points</h1>
      <p className="mt-1 text-sm text-muted">
        In production, customers reach a visit by scanning a shop&apos;s entry QR code. This page
        is a dev convenience for local testing.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            href={`/v/${shop.entryQrToken}`}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium hover:bg-page"
          >
            {shop.name} → /v/{shop.entryQrToken}
          </Link>
        ))}
      </div>

      <Link href="/me/library" className="mt-6 text-sm font-medium text-accent">
        My Library →
      </Link>
    </main>
  );
}
