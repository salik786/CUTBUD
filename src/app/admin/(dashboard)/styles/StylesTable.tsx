"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StyleCatalog } from "@prisma/client";
import Image from "next/image";
import { getDisplayImageUrl } from "@/lib/styleImage";
import { FACE_SHAPE_OPTIONS } from "@/lib/adminStyleFilters";
import { StyleDrawer } from "./StyleDrawer";

type SortField = "name" | "category" | "lengthCategory" | "trendScore" | "updatedAt" | "active";

const COLUMNS: { key: SortField | "thumbnail" | "id" | "texture" | "faceShapes" | "model" | "inspiration" | "featured" | "actions"; label: string; sortable: boolean }[] = [
  { key: "thumbnail", label: "", sortable: false },
  { key: "id", label: "ID", sortable: false },
  { key: "name", label: "Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "lengthCategory", label: "Length", sortable: true },
  { key: "texture", label: "Texture", sortable: false },
  { key: "faceShapes", label: "Face Shapes", sortable: false },
  { key: "model", label: "Model", sortable: false },
  { key: "inspiration", label: "Inspiration", sortable: false },
  { key: "trendScore", label: "Trend", sortable: true },
  { key: "active", label: "Status", sortable: true },
  { key: "featured", label: "Featured", sortable: false },
  { key: "updatedAt", label: "Updated", sortable: true },
  { key: "actions", label: "", sortable: false },
];

export function StylesTable({
  styles,
  total,
  page,
  pageSize,
  categories,
  models,
}: {
  styles: StyleCatalog[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  models: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStyle, setOpenStyle] = useState<StyleCatalog | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sort = searchParams.get("sort") ?? "updatedAt";
  const dir = searchParams.get("dir") ?? "desc";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // Any filter/sort change resets pagination — staying on page 4 of a
    // now-5-row result set would just show an empty table.
    if (!("page" in next)) params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce free-text search.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== (searchParams.get("q") ?? "")) pushParams({ q });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function toggleSort(field: SortField) {
    if (sort === field) {
      pushParams({ sort: field, dir: dir === "asc" ? "desc" : "asc" });
    } else {
      pushParams({ sort: field, dir: "asc" });
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === styles.length ? new Set() : new Set(styles.map((s) => s.id))));
  }

  async function bulkAction(action: "activate" | "deactivate" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} style(s)? This can't be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/styles/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      const data = await res.json();
      if (data.failed?.length) {
        alert(`${data.failed.length} style(s) couldn't be deleted (already used in cut cards) — deactivate those instead.`);
      }
      setSelected(new Set());
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  }

  async function toggleField(style: StyleCatalog, field: "active" | "featured") {
    setTogglingId(style.id);
    try {
      await fetch(`/api/admin/styles/${style.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !style[field] }),
      });
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, id, category…"
          className="w-56 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => pushParams({ category: e.target.value })}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("model") ?? ""}
          onChange={(e) => pushParams({ model: e.target.value })}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("faceShape") ?? ""}
          onChange={(e) => pushParams({ faceShape: e.target.value })}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All face shapes</option>
          {FACE_SHAPE_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => pushParams({ status: e.target.value })}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(searchParams.get("category") || searchParams.get("model") || searchParams.get("faceShape") || searchParams.get("status") || q) && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              pushParams({ q: undefined, category: undefined, model: undefined, faceShape: undefined, status: undefined });
            }}
            className="text-sm font-medium text-muted hover:underline"
          >
            Reset filters
          </button>
        )}
        <span className="ml-auto text-xs text-muted">{total} style{total === 1 ? "" : "s"}</span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={styles.length > 0 && selected.size === styles.length}
                  onChange={toggleAll}
                  aria-label="Select all rows on this page"
                />
              </th>
              {COLUMNS.filter((c) => c.key !== "thumbnail" && c.key !== "actions").map((col) => (
                <th key={col.key} className="px-3 py-2.5 text-left font-semibold text-muted">
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key as SortField)}
                      className="flex items-center gap-1 hover:text-ink"
                    >
                      {col.label}
                      {sort === col.key && <span>{dir === "asc" ? "↑" : "↓"}</span>}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="w-16 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {styles.map((style, i) => (
              <tr
                key={style.id}
                onClick={() => setOpenStyle(style)}
                className={`cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-accent-light/40 ${
                  i % 2 === 1 ? "bg-page/50" : ""
                }`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(style.id)} onChange={() => toggleRow(style.id)} />
                </td>
                <td className="px-3 py-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-page">
                    {getDisplayImageUrl(style) && (
                      <Image src={getDisplayImageUrl(style)!} alt="" fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted">{style.id}</td>
                <td className="max-w-[180px] truncate px-3 py-2 font-medium">{style.name}</td>
                <td className="px-3 py-2 text-muted">{style.category ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{style.lengthCategory ?? "—"}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-muted">{style.textureCompat ?? "—"}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-muted">{style.faceShapeFit || "—"}</td>
                <td className="px-3 py-2 text-muted">{style.modelId ?? "—"}</td>
                <td className="max-w-[160px] truncate px-3 py-2 text-muted">{style.inspiredBy ?? "—"}</td>
                <td className="px-3 py-2 text-muted">{style.trendScore ?? "—"}</td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleField(style, "active")}
                    disabled={togglingId === style.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                      style.active ? "bg-emerald-100 text-emerald-700" : "bg-border text-muted"
                    }`}
                  >
                    {style.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleField(style, "featured")}
                    disabled={togglingId === style.id}
                    className={`text-lg disabled:opacity-50 ${style.featured ? "" : "opacity-25 grayscale"}`}
                    aria-label={style.featured ? "Unfeature" : "Feature"}
                  >
                    ★
                  </button>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">
                  {style.updatedAt.toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-xs text-accent">Edit →</span>
                </td>
              </tr>
            ))}
            {styles.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-10 text-center text-sm text-muted">
                  No styles match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => pushParams({ page: String(page - 1) })}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => pushParams({ page: String(page + 1) })}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => bulkAction("activate")}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-page disabled:opacity-50"
            >
              Activate
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => bulkAction("deactivate")}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-page disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => bulkAction("delete")}
              className="rounded-lg border border-danger/30 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-muted hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {openStyle && <StyleDrawer style={openStyle} onClose={() => setOpenStyle(null)} />}
    </div>
  );
}
