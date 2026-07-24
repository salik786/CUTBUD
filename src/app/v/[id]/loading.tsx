export default function Loading() {
  return (
    <main className="hero-gradient flex flex-1 flex-col px-6 py-10">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-16 h-10 w-3/4 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-3 h-5 w-1/2 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-8 h-32 animate-pulse rounded-2xl bg-white/5" />
    </main>
  );
}
