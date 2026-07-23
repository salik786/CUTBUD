import { BottomNav } from "@/components/BottomNav";

export default function ScanPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <h1 className="text-lg font-bold">Scan QR</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">
          Point your camera at a shop&apos;s entry QR code to start a visit — camera capture ships
          in a later phase.
        </p>
      </main>
      <BottomNav active="qr" />
    </div>
  );
}
