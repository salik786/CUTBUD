"use client";

import { useState } from "react";
import type { StyleCatalog } from "@prisma/client";
import { StyleGrid } from "./StyleGrid";
import { SwipeDeck } from "./SwipeDeck";

type View = "grid" | "swipe";

export function ViewSwitcher({
  visitId,
  initialStyles,
  initialHasMore,
  faceShape,
  filter,
  q,
  pageSize,
}: {
  visitId: string;
  initialStyles: StyleCatalog[];
  initialHasMore: boolean;
  faceShape?: string;
  filter?: string;
  q?: string;
  pageSize: number;
}) {
  const [view, setView] = useState<View>("grid");
  const resetKey = `${filter ?? ""}|${q ?? ""}|${faceShape ?? ""}`;

  return (
    <>
      <div className="fade-up mt-4 flex gap-2" style={{ animationDelay: "170ms" }}>
        <ViewButton active={view === "grid"} onClick={() => setView("grid")} label="Grid" icon="▦" />
        <ViewButton active={view === "swipe"} onClick={() => setView("swipe")} label="Swipe" icon="🔥" />
      </div>

      {view === "grid" ? (
        <StyleGrid
          key={`grid-${resetKey}`}
          visitId={visitId}
          initialStyles={initialStyles}
          initialHasMore={initialHasMore}
          faceShape={faceShape}
          filter={filter}
          q={q}
          pageSize={pageSize}
        />
      ) : (
        <SwipeDeck key={`swipe-${resetKey}`} visitId={visitId} faceShape={faceShape} filter={filter} q={q} />
      )}
    </>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "bg-accent text-white" : "bg-surface text-muted hover:bg-accent-light"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
