import { BottomNav } from "@/components/BottomNav";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">Home</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">
          Your dashboard lands here in a later phase — scan a shop&apos;s QR code to start a new
          visit.
        </p>
      </main>
      <BottomNav active="home" />
    </div>
  );
}
