"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ImageUploader } from "../ImageUploader";

export interface StyleFormValues {
  id?: string;
  name: string;
  description: string;
  basePrompt: string;
  faceShapeFit: string;
  guardNumber: string;
  lengthMm: string;
  fadeType: string;
  imageUrl: string;
  leftImageUrl: string;
  rightImageUrl: string;
  backImageUrl: string;
  inspiredBy: string;
  active: boolean;
}

const EMPTY: StyleFormValues = {
  name: "",
  description: "",
  basePrompt: "",
  faceShapeFit: "",
  guardNumber: "",
  lengthMm: "",
  fadeType: "",
  imageUrl: "",
  leftImageUrl: "",
  rightImageUrl: "",
  backImageUrl: "",
  inspiredBy: "",
  active: true,
};

export function StyleForm({ initial }: { initial?: StyleFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<StyleFormValues>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof StyleFormValues>(key: K, value: StyleFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(values.id ? `/api/admin/styles/${values.id}` : "/api/admin/styles", {
        method: values.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSaving(false);
        return;
      }
      router.push("/admin/styles");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!values.id) return;
    if (!confirm(`Delete "${values.name}"? This can't be undone.`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/styles/${values.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't delete this style");
      setDeleting(false);
      return;
    }
    router.push("/admin/styles");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Photos</label>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="mb-1.5 text-xs text-muted">Front</p>
            <ImageUploader value={values.imageUrl} onChange={(url) => set("imageUrl", url)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">Left</p>
            <ImageUploader value={values.leftImageUrl} onChange={(url) => set("leftImageUrl", url)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">Right</p>
            <ImageUploader value={values.rightImageUrl} onChange={(url) => set("rightImageUrl", url)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted">Back</p>
            <ImageUploader value={values.backImageUrl} onChange={(url) => set("backImageUrl", url)} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Only Front is required — any angle left empty shows as pending on the cut card.
        </p>
      </div>

      <Field label="Name">
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
        />
      </Field>

      <Field label="Description">
        <textarea
          required
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent min-h-20"
        />
      </Field>

      <Field label="Base prompt" hint="Used as the plain-language instruction text for the barber">
        <textarea
          required
          value={values.basePrompt}
          onChange={(e) => set("basePrompt", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent min-h-16"
        />
      </Field>

      <Field label="Face shape fit" hint="Comma-separated, e.g. oval,square">
        <input
          required
          value={values.faceShapeFit}
          onChange={(e) => set("faceShapeFit", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Guard #">
          <input
            value={values.guardNumber}
            onChange={(e) => set("guardNumber", e.target.value)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
          />
        </Field>
        <Field label="Length (mm)">
          <input
            value={values.lengthMm}
            onChange={(e) => set("lengthMm", e.target.value)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
          />
        </Field>
        <Field label="Fade type">
          <input
            value={values.fadeType}
            onChange={(e) => set("fadeType", e.target.value)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
          />
        </Field>
      </div>

      <Field label="Inspired by" hint="Optional credit shown on the cut card, e.g. a barber or stylist name">
        <input
          value={values.inspiredBy}
          onChange={(e) => set("inspiredBy", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
        />
      </Field>

      {values.id && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          Active (visible in recommendations)
        </label>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <div className="w-48">
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving…" : values.id ? "Save Changes" : "Create Style"}
          </PrimaryButton>
        </div>
        {values.id && (
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
