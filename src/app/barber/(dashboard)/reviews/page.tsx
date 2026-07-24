import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";

export default async function BarberReviewsPage() {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  const [ratings, agg] = await Promise.all([
    prisma.rating.findMany({
      where: { shopId: barber.shopId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.rating.aggregate({
      where: { shopId: barber.shopId },
      _avg: { stars: true },
      _count: { stars: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-bold tabular">{agg._avg.stars ? agg._avg.stars.toFixed(1) : "—"}</p>
        <span className="text-lg">⭐</span>
        <p className="text-sm text-muted">
          from {agg._count.stars} review{agg._count.stars === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {ratings.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{"⭐".repeat(r.stars)}</span>
              <span className="text-xs text-muted">{r.createdAt.toLocaleDateString()}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-ink/80">{r.comment}</p>}
          </div>
        ))}
        {ratings.length === 0 && (
          <p className="mt-6 text-sm text-muted">No reviews yet — they show up here as customers rate their cuts.</p>
        )}
      </div>
    </div>
  );
}
