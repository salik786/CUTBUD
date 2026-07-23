export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "bg-accent text-white" : "bg-surface text-muted hover:bg-accent-light"
      }`}
    >
      {label}
    </button>
  );
}
