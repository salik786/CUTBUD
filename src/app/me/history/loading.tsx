export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="h-6 w-24 animate-pulse rounded bg-border" />
      </header>
      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-6">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <div className="skeleton-shimmer h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
