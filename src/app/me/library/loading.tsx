export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="h-6 w-28 animate-pulse rounded bg-border" />
      </header>
      <div className="flex gap-2 border-b border-border bg-surface px-6 py-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-border" />
        ))}
      </div>
      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="skeleton-shimmer aspect-square w-full" />
              <div className="p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
