import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShopToggleActive } from "./ShopToggleActive";

export default async function AdminShopsPage() {
  const shops = await prisma.shop.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
        <Link
          href="/admin/shops/new"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Shop
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="font-semibold">{shop.name}</p>
              <p className="text-sm text-muted">{shop.address}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                Entry: /v/{shop.entryQrToken}
              </p>
            </div>
            <ShopToggleActive shopId={shop.id} active={shop.active} />
          </div>
        ))}
        {shops.length === 0 && <p className="text-sm text-muted">No shops yet.</p>}
      </div>
    </div>
  );
}
