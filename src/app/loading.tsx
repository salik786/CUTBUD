/**
 * Fallback shown instantly on navigation for any route that doesn't define
 * its own more specific loading.tsx. Deliberately neutral (not hero-styled)
 * since it has to work as a generic in-between for both dark and light
 * screens — routes with a distinctive layout should get their own
 * loading.tsx instead of relying on this.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </main>
  );
}
