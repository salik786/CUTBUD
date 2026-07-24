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
 *
 * `sizes` MUST reflect how wide this component actually renders at each
 * breakpoint — next/image uses it to pick which source width to request.
 * Getting this wrong (e.g. a hardcoded small value on something that
 * actually renders full-width) is what makes an image look blurry: the
 * browser fetches an image sized for a small slot, then the browser upscales
 * it to fill the real, larger box. There's no single correct default across
 * every place this component is used (hero photo vs. a 4-up thumbnail row),
 * so callers should pass their own `sizes` — the fallback here is only
 * right for something roughly half-viewport-wide, which is not most usages.
 */
export function PhotoPlaceholder({
  label,
  src,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, 50vw",
  objectPosition = "center",
  quality = 90,
}: {
  label?: string;
  src?: string | null;
  className?: string;
  priority?: boolean;
  /** How wide this actually renders at each breakpoint — see note above. */
  sizes?: string;
  /** CSS object-position — "top" keeps a face/hairline in frame instead of
   * centering on the torso for portraits with a lot of headroom. */
  objectPosition?: "center" | "top" | "bottom";
  quality?: number;
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
          sizes={sizes}
          quality={quality}
          priority={priority}
          style={{ objectPosition }}
          className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
