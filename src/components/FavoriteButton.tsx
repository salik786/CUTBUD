"use client";

import { useState } from "react";

export function FavoriteButton({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => !a);
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 shadow-sm transition-transform duration-150 active:scale-90 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 transition-colors duration-150"
        fill={active ? "var(--color-danger)" : "none"}
        stroke={active ? "var(--color-danger)" : "var(--color-muted)"}
        strokeWidth={1.8}
      >
        <path d="M12 20.5s-7-4.35-9.5-8.5C.7 8.6 2.4 5 6 5c2 0 3.5 1.2 4.2 2.4a.9.9 0 0 0 1.6 0C12.5 6.2 14 5 16 5c3.6 0 5.3 3.6 3.5 7-2.5 4.15-9.5 8.5-9.5 8.5Z" />
      </svg>
    </button>
  );
}
