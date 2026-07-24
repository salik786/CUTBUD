import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";
import { redirect } from "next/navigation";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export default async function BarberOverviewPage() {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  const since30d = daysAgo(30);

  const [scans30d, stylesBrowsed30d, ratingAgg, offeredCount] = await Promise.all([
    prisma.visit.count({ where: { shopId: barber.shopId, startedAt: { gte: since30d } } }),
    prisma.styleGeneration.count({
      where: { visit: { shopId: barber.shopId }, generatedAt: { gte: since30d } },
    }),
    prisma.rating.aggregate({
      where: { shopId: barber.shopId },
      _avg: { stars: true },
      _count: { stars: true },
    }),
    prisma.shopStyle.count({ where: { shopId: barber.shopId, available: true } }),
  ]);

  const avgRating = ratingAgg._avg.stars;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted">Last 30 days at {barber.shop.name}.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="QR Scans" value={scans30d} />
        <StatCard label="Styles Browsed" value={stylesBrowsed30d} />
        <StatCard
          label="Average Rating"
          value={avgRating ? `${avgRating.toFixed(1)} ⭐` : "—"}
          hint={ratingAgg._count.stars ? `${ratingAgg._count.stars} review${ratingAgg._count.stars === 1 ? "" : "s"}` : "No reviews yet"}
        />
        <StatCard label="Styles You Offer" value={offeredCount} hint="Manage in Hairstyles tab" />
      </div>

      {offeredCount === 0 && (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-light p-4">
          <p className="text-sm font-semibold text-accent">You haven&apos;t set up your hairstyles yet</p>
          <p className="mt-1 text-xs text-ink/70">
            Customers who scan your QR code only see styles you&apos;ve marked as available. Head
            to the Hairstyles tab to turn some on.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
