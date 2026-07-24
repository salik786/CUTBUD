"use client";

import { useState } from "react";
import Image from "next/image";

interface Row {
  styleCatalogId: string;
  name: string;
  category: string | null;
  imageUrl: string | null | undefined;
  available: boolean;
  skillLevel: string;
  price: string;
  durationMin: number | null;
  requiresAppointment: boolean;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"];

export function ShopStylesList({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [q, setQ] = useState("");

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.styleCatalogId === id ? { ...r, ...patch } : r)));
  }

  async function save(row: Row) {
    await fetch("/api/barber/shop-styles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styleCatalogId: row.styleCatalogId,
        available: row.available,
        skillLevel: row.skillLevel,
        price: row.price,
        durationMin: row.durationMin,
        requiresAppointment: row.requiresAppointment,
      }),
    });
  }

  async function toggleAvailable(row: Row) {
    const next = { ...row, available: !row.available };
    updateRow(row.styleCatalogId, { available: next.available });
    await save(next);
  }

  const filtered = q
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          (r.category ?? "").toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  const offeredCount = rows.filter((r) => r.available).length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search hairstyles…"
          className="w-64 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
        />
        <span className="text-xs text-muted">{offeredCount} of {rows.length} offered</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((row) => (
          <StyleRow key={row.styleCatalogId} row={row} onUpdate={updateRow} onSave={save} onToggle={toggleAvailable} />
        ))}
        {filtered.length === 0 && <p className="mt-6 text-sm text-muted">No styles match &quot;{q}&quot;.</p>}
      </div>
    </div>
  );
}

function StyleRow({
  row,
  onUpdate,
  onSave,
  onToggle,
}: {
  row: Row;
  onUpdate: (id: string, patch: Partial<Row>) => void;
  onSave: (row: Row) => Promise<void>;
  onToggle: (row: Row) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(row);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl border p-3 transition-colors ${row.available ? "border-accent/30 bg-accent-light/30" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-page">
          {row.imageUrl && <Image src={row.imageUrl} alt="" fill className="object-cover" sizes="48px" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{row.name}</p>
          <p className="truncate text-xs text-muted">{row.category ?? "—"}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(row)}
          role="switch"
          aria-checked={row.available}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${row.available ? "bg-accent" : "bg-border"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${row.available ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {row.available && (
        <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border/60 pt-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted">Skill</span>
            <select
              value={row.skillLevel}
              onChange={(e) => onUpdate(row.styleCatalogId, { skillLevel: e.target.value })}
              className="rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="">—</option>
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted">Price</span>
            <input
              value={row.price}
              onChange={(e) => onUpdate(row.styleCatalogId, { price: e.target.value })}
              placeholder="$35"
              className="w-20 rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted">Minutes</span>
            <input
              type="number"
              min={0}
              value={row.durationMin ?? ""}
              onChange={(e) => onUpdate(row.styleCatalogId, { durationMin: e.target.value ? Number(e.target.value) : null })}
              placeholder="30"
              className="w-20 rounded-lg border border-border bg-page px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-1.5 pb-1.5 text-xs">
            <input
              type="checkbox"
              checked={row.requiresAppointment}
              onChange={(e) => onUpdate(row.styleCatalogId, { requiresAppointment: e.target.checked })}
            />
            Needs appointment
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="ml-auto rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
