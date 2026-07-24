"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterSheet } from "./FilterSheet";

const FILTER_KEYS = ["filter", "texture", "length", "maintenance", "premium", "sort"] as const;

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  function pushParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // Debounce free-text search so every keystroke doesn't trigger a fetch.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (query !== (searchParams.get("q") ?? "")) pushParams({ q: query });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hairstyles…"
            className="w-full rounded-2xl border border-border bg-surface py-3 pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Filters"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-base"
        >
          ⚙️
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {sheetOpen && <FilterSheet onClose={() => setSheetOpen(false)} onApply={pushParams} />}
    </>
  );
}
