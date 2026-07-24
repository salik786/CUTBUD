export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 py-8">
      <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 animate-pulse rounded-full bg-border" />
        ))}
      </div>

      <div className="mt-8 h-8 w-2/3 animate-pulse rounded-lg bg-border" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded-lg bg-border" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="skeleton-shimmer aspect-square w-full rounded-2xl" />
        <div className="skeleton-shimmer aspect-square w-full rounded-2xl" />
      </div>

      <div className="mt-7 h-4 w-40 animate-pulse rounded bg-border" />
      <div className="mt-2 h-6 w-32 animate-pulse rounded bg-border" />

      <div className="mt-6 h-20 animate-pulse rounded-xl bg-border" />
      <div className="mt-7 h-12 animate-pulse rounded-xl bg-border" />
    </main>
  );
}
