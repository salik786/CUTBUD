import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [styleCount, shopCount, visitCount, ratingCount] = await Promise.all([
    prisma.styleCatalog.count(),
    prisma.shop.count(),
    prisma.visit.count(),
    prisma.rating.count(),
  ]);

  const stats = [
    { label: "Styles", value: styleCount, href: "/admin/styles" },
    { label: "Shops", value: shopCount, href: "/admin/shops" },
    { label: "Visits", value: visitCount, href: null },
    { label: "Ratings", value: ratingCount, href: null },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-3xl font-bold tabular">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="transition-opacity hover:opacity-80">
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/styles/new"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Style
        </Link>
        <Link
          href="/admin/shops/new"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-page"
        >
          + Add Shop
        </Link>
      </div>
    </div>
  );
}
