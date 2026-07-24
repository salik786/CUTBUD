"use client";

import { useState } from "react";
import type { StyleCatalog } from "@prisma/client";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { FavoriteButton } from "@/components/FavoriteButton";
import { GenerateStyleLink } from "./GenerateStyleLink";

export function StyleGrid({
  visitId,
  initialStyles,
  initialHasMore,
  faceShape,
  pageSize,
}: {
  visitId: string;
  initialStyles: StyleCatalog[];
  initialHasMore: boolean;
  faceShape?: string;
  pageSize: number;
}) {
  const [styles, setStyles] = useState(initialStyles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(pageSize),
      });
      if (faceShape) params.set("faceShape", faceShape);
      const res = await fetch(`/api/styles/recommendations?${params}`);
      const data = await res.json();
      setStyles((prev) => [...prev, ...data.styles]);
      setHasMore(data.hasMore);
      setPage(page + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {styles.map((style, i) => (
          <div
            key={style.id}
            className="fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-200 hover:shadow-lg"
            style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
          >
            <GenerateStyleLink visitId={visitId} styleCatalogId={style.id}>
              <PhotoPlaceholder
                src={style.imageUrl}
                className="aspect-square w-full rounded-none"
                sizes="(max-width: 640px) 50vw, 340px"
                objectPosition="top"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{style.name}</p>
                <p className="text-xs text-muted">{style.fadeType ?? style.description}</p>
              </div>
            </GenerateStyleLink>
            <FavoriteButton className="absolute right-2 top-2" />
          </div>
        ))}

        {loading &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="skeleton-shimmer aspect-square w-full" />
              <div className="p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-border bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load More Styles"}
        </button>
      )}
    </>
  );
}
