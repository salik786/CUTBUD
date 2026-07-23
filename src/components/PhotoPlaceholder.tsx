/**
 * Renders a real reference photo when `src` is provided; otherwise falls back
 * to a shimmer skeleton (used for angles/generations Phase 2 hasn't produced yet).
 */
export function PhotoPlaceholder({
  label,
  src,
  className = "",
}: {
  label?: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={label ?? ""} className={`w-full rounded-xl object-cover ${className}`} />
    );
  }

  return (
    <div className={`skeleton-shimmer relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
      {label && (
        <span className="font-medium text-[11px] uppercase tracking-wide text-muted">{label}</span>
      )}
    </div>
  );
}
