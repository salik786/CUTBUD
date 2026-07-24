"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Renders a real reference photo when `src` is provided, via next/image so
 * the (large, ~4MB) originals get resized/re-encoded instead of shipped raw.
 * Always shows the shimmer skeleton first and crossfades the photo in once
 * it's actually decoded — a slow image never just pops in or leaves a blank
 * gap, and a missing `src` falls back to the same shimmer indefinitely
 * (used for angles/generations Phase 2 hasn't produced yet).
 */
export function PhotoPlaceholder({
  label,
  src,
  className = "",
  priority = false,
}: {
  label?: string;
  src?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div
        className={`skeleton-shimmer absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        {label && (
          <span className="font-medium text-[11px] uppercase tracking-wide text-muted">{label}</span>
        )}
      </div>
      {src && (
        <Image
          src={src}
          alt={label ?? ""}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
