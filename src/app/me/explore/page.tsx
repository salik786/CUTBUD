import { BottomNav } from "@/components/BottomNav";

export default function ExplorePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">Explore</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">Browsing styles outside a shop visit ships in a later phase.</p>
      </main>
      <BottomNav active="explore" />
    </div>
  );
}
