"use client";

import { useState } from "react";
import type { StyleCatalog } from "@prisma/client";
import { StyleGrid } from "./StyleGrid";
import { SwipeDeck } from "./SwipeDeck";

type View = "swipe" | "grid";

export function ViewSwitcher({
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
  const [view, setView] = useState<View>("swipe");
  const resetKey = `${filter ?? ""}|${q ?? ""}|${texture ?? ""}|${length ?? ""}|${maintenance ?? ""}|${premium}|${sort ?? ""}|${faceShape ?? ""}`;

  const commonProps = { visitId, faceShape, filter, q, texture, length, maintenance, premium, sort };

  return (
    <>
      <div className="fade-up mt-3 inline-flex w-fit rounded-full bg-surface p-1" style={{ animationDelay: "110ms" }}>
        <SegmentButton active={view === "swipe"} onClick={() => setView("swipe")} icon="🔥" label="Swipe" />
        <SegmentButton active={view === "grid"} onClick={() => setView("grid")} icon="⊞" label="Grid" />
      </div>

      {view === "grid" ? (
        <StyleGrid
          key={`grid-${resetKey}`}
          initialStyles={initialStyles}
          initialHasMore={initialHasMore}
          pageSize={pageSize}
          {...commonProps}
        />
      ) : (
        <SwipeDeck key={`swipe-${resetKey}`} {...commonProps} />
      )}
    </>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "bg-accent text-white shadow-sm" : "text-muted"
      }`}
    >
      <span className="text-[13px]">{icon}</span>
      {label}
    </button>
  );
}
