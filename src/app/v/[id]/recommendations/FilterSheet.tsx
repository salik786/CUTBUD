"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { STYLE_FILTERS, TEXTURE_FILTERS, LENGTH_FILTERS, MAINTENANCE_FILTERS } from "@/lib/styleFilters";

const CATEGORY_FILTERS = STYLE_FILTERS.filter((f) => f.label !== "All");

export function FilterSheet({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (next: Record<string, string | undefined>) => void;
}) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "");
  const [texture, setTexture] = useState(searchParams.get("texture") ?? "");
  const [length, setLength] = useState(searchParams.get("length") ?? "");
  const [maintenance, setMaintenance] = useState(searchParams.get("maintenance") ?? "");
  const [premium, setPremium] = useState(searchParams.get("premium") === "1");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function apply() {
    onApply({
      filter: filter || undefined,
      texture: texture || undefined,
      length: length || undefined,
      maintenance: maintenance || undefined,
      premium: premium ? "1" : undefined,
      sort: sort || undefined,
    });
    onClose();
  }

  function reset() {
    setFilter("");
    setTexture("");
    setLength("");
    setMaintenance("");
    setPremium(false);
    setSort("");
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="fade-in-drawer relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-t-[24px] bg-page shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-page/95 px-5 py-4 backdrop-blur">
          <h2 className="text-base font-bold">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <ChipGroup label="Style" options={CATEGORY_FILTERS.map((f) => f.label)} value={filter ? CATEGORY_FILTERS.find((f) => f.keyword === filter)?.label ?? "" : ""} onChange={(label) => setFilter(CATEGORY_FILTERS.find((f) => f.label === label)?.keyword ?? "")} />
          <ChipGroup label="Hair Type" options={TEXTURE_FILTERS} value={texture} onChange={setTexture} />
          <ChipGroup label="Length" options={LENGTH_FILTERS} value={length} onChange={setLength} />
          <ChipGroup label="Difficulty" options={MAINTENANCE_FILTERS} value={maintenance} onChange={setMaintenance} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">More</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active={sort === "trending"} onClick={() => setSort(sort === "trending" ? "" : "trending")}>
                🔥 Trending
              </Chip>
              <Chip active={sort === "recent"} onClick={() => setSort(sort === "recent" ? "" : "recent")}>
                🆕 Recently Added
              </Chip>
              <Chip active={premium} onClick={() => setPremium((p) => !p)}>
                ⭐ Premium
              </Chip>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-page px-5 py-4">
          <button type="button" onClick={reset} className="text-sm font-medium text-muted hover:underline">
            Reset
          </button>
          <button
            type="button"
            onClick={apply}
            className="ml-auto flex-1 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip key={option} active={value === option} onClick={() => onChange(value === option ? "" : option)}>
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted hover:bg-accent-light"
      }`}
    >
      {children}
    </button>
  );
}
