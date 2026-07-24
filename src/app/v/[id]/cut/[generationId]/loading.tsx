export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-6 py-8">
      <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 animate-pulse rounded-full bg-border" />
        ))}
      </div>

      <div className="mt-8 flex items-start justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded-lg bg-border" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
        </div>
      </div>

      <div className="skeleton-shimmer mt-5 aspect-[4/3] w-full rounded-xl" />

      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer aspect-square w-full rounded-xl" />
        ))}
      </div>

      <div className="mt-6 h-48 animate-pulse rounded-2xl bg-border/60" />
      <div className="mt-6 h-12 animate-pulse rounded-xl bg-border" />
    </main>
  );
}
