"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { STYLE_FILTERS } from "@/lib/styleFilters";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function pushParams(next: { filter?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["filter", "q"] as const) {
      if (next[key] === undefined) continue;
      if (next[key]) params.set(key, next[key]!);
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
      <div className="fade-up mt-5" style={{ animationDelay: "140ms" }}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hairstyles, fades, inspiration…"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="fade-up mt-3 flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: "160ms" }}>
        {STYLE_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => pushParams({ filter: f.keyword })}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
              activeFilter === f.keyword
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-accent-light"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}
