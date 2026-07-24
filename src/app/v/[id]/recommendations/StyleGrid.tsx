"use client";

import { useState } from "react";
import type { StyleCatalog } from "@prisma/client";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getDisplayImageUrl } from "@/lib/styleImage";
import { GenerateStyleLink } from "./GenerateStyleLink";

export function StyleGrid({
  visitId,
  initialStyles,
  initialHasMore,
  faceShape,
  filter,
  q,
  texture,
  length,
  maintenance,
  premium,
  sort,
  pageSize,
}: {
  visitId: string;
  initialStyles: StyleCatalog[];
  initialHasMore: boolean;
  faceShape?: string;
  filter?: string;
  q?: string;
  texture?: string;
  length?: string;
  maintenance?: string;
  premium?: boolean;
  sort?: string;
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
      if (filter) params.set("filter", filter);
      if (q) params.set("q", q);
      if (texture) params.set("texture", texture);
      if (length) params.set("length", length);
      if (maintenance) params.set("maintenance", maintenance);
      if (premium) params.set("premium", "1");
      if (sort) params.set("sort", sort);
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
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {styles.map((style, i) => (
          <div
            key={style.id}
            className="fade-up group relative overflow-hidden rounded-[20px] bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md"
            style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
          >
            <GenerateStyleLink visitId={visitId} styleCatalogId={style.id}>
              <PhotoPlaceholder
                src={getDisplayImageUrl(style)}
                className="aspect-[3/4] w-full rounded-none"
                sizes="(max-width: 640px) 50vw, 340px"
                objectPosition="top"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6">
                <p className="truncate text-[13px] font-semibold text-white">{style.name}</p>
              </div>
            </GenerateStyleLink>
            <FavoriteButton className="absolute right-2 top-2" />
            {style.featured && (
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-accent">
                ⭐ Premium
              </span>
            )}
          </div>
        ))}

        {loading &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="overflow-hidden rounded-[20px] bg-surface">
              <div className="skeleton-shimmer aspect-[3/4] w-full" />
            </div>
          ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="mt-5 w-full rounded-2xl border border-border bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load More Styles"}
        </button>
      )}
    </>
  );
}
