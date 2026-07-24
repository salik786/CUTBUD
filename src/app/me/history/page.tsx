import { BottomNav } from "@/components/BottomNav";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const savedCuts = user
    ? await prisma.savedCut.findMany({
        where: { userId: user.id },
        include: { styleGeneration: { include: { styleCatalog: true } }, shop: true },
        orderBy: { savedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">History</h1>
        <button aria-label="Notifications" className="text-muted">
          🔔
        </button>
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-6">
        {savedCuts.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">
            No past visits yet. Once you save a cut, it&apos;ll show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {savedCuts.map((cut) => (
              <div
                key={cut.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <PhotoPlaceholder
                  src={cut.styleGeneration.styleCatalog.imageUrl}
                  className="h-14 w-14 shrink-0"
                  sizes="56px"
                  objectPosition="top"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{cut.styleGeneration.styleCatalog.name}</p>
                  <p className="truncate text-xs text-muted">
                    {cut.shop?.name ?? "Unknown shop"} · {cut.savedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="history" />
    </div>
  );
}
