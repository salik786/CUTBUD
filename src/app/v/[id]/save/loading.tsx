export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="h-16 w-16 animate-pulse rounded-full bg-border" />
      <div className="mt-5 h-8 w-2/3 animate-pulse rounded-lg bg-border" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded-lg bg-border" />
      <div className="mt-7 h-12 w-full animate-pulse rounded-xl bg-border" />
    </main>
  );
}
