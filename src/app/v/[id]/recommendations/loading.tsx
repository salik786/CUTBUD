export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 animate-pulse rounded-full bg-border" />
        ))}
      </div>

      <div className="mt-8 h-8 w-2/3 animate-pulse rounded-lg bg-border" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded-lg bg-border" />

      <div className="mt-5 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-border" />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
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
  );
}
