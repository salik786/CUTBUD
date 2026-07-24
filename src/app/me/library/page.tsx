import { BottomNav } from "@/components/BottomNav";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getDisplayImageUrl } from "@/lib/styleImage";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const savedCuts = user
    ? await prisma.savedCut.findMany({
        where: { userId: user.id },
        include: { styleGeneration: { include: { styleCatalog: true } } },
        orderBy: { savedAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">My Library</h1>
        <button aria-label="Notifications" className="text-muted">
          🔔
        </button>
      </header>

      <div className="flex gap-2 border-b border-border bg-surface px-6 py-3">
        <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white">
          Hairstyles
        </span>
        <span className="rounded-full px-4 py-1.5 text-sm font-medium text-muted">Barbers</span>
        <span className="rounded-full px-4 py-1.5 text-sm font-medium text-muted">Reviews</span>
      </div>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-6">
        {savedCuts.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">
            No saved cuts yet. Rate your next haircut to save it here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedCuts.map((cut) => (
              <div key={cut.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <PhotoPlaceholder
                  src={getDisplayImageUrl(cut.styleGeneration.styleCatalog)}
                  className="aspect-square w-full rounded-none"
                  sizes="(max-width: 640px) 50vw, 340px"
                  objectPosition="top"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{cut.styleGeneration.styleCatalog.name}</p>
                  <p className="text-xs text-muted">{cut.savedAt.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  );
}
