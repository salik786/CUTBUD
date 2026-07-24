"use client";

import { useState } from "react";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";

export type Angle = "Front" | "Left" | "Right" | "Back";

export function CutCardGallery({
  images,
}: {
  images: Record<Angle, string | null>;
}) {
  const angles = Object.keys(images) as Angle[];
  const [selected, setSelected] = useState<Angle>("Front");
  const [zoomed, setZoomed] = useState(false);
  const mainSrc = images[selected];

  return (
    <>
      <div className="fade-up relative mx-auto mt-5 w-full" style={{ animationDelay: "100ms" }}>
        <PhotoPlaceholder
          src={mainSrc}
          label={`${selected} reference`}
          className="mx-auto aspect-[4/3] w-full"
        />
        {mainSrc && (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Zoom photo"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-ink/90"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21M8 10.5h5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="fade-up mx-auto mt-3 grid w-full grid-cols-4 gap-2" style={{ animationDelay: "140ms" }}>
        {angles.map((angle) => (
          <button
            key={angle}
            type="button"
            onClick={() => setSelected(angle)}
            className={`relative overflow-hidden rounded-xl transition-shadow ${
              selected === angle ? "ring-2 ring-accent ring-offset-2 ring-offset-page" : ""
            }`}
          >
            <PhotoPlaceholder src={images[angle]} className="aspect-square w-full" />
            <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[9px] uppercase tracking-wide text-white">
              {angle}
            </span>
          </button>
        ))}
      </div>

      {zoomed && mainSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainSrc}
            alt={`${selected} reference, zoomed`}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
