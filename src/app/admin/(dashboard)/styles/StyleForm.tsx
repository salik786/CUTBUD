"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { STYLE_ANGLES, type StyleAngle } from "@/lib/styleImage";
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
  category: string;
  textureCompat: string;
  density: string;
  lengthCategory: string;
  maintenance: string;
  beardPairing: string;
  occasion: string;
  targetAudience: string;
  imageUrl: string;
  leftImageUrl: string;
  rightImageUrl: string;
  backImageUrl: string;
  displayAngle: string;
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
  category: "",
  textureCompat: "",
  density: "",
  lengthCategory: "",
  maintenance: "",
  beardPairing: "",
  occasion: "",
  targetAudience: "",
  imageUrl: "",
  leftImageUrl: "",
  rightImageUrl: "",
  backImageUrl: "",
  displayAngle: "front",
  inspiredBy: "",
  active: true,
};

const TEXTURE_OPTIONS = ["Straight", "Wavy", "Curly", "Coily"];
const DENSITY_OPTIONS = ["Thin", "Medium", "Thick"];
const LENGTH_CATEGORY_OPTIONS = ["Very Short", "Short", "Medium", "Long"];
const MAINTENANCE_OPTIONS = ["Low", "Medium", "High"];
const BEARD_PAIRING_OPTIONS = ["None", "Optional", "Required"];
const OCCASION_OPTIONS = ["Daily", "Professional", "Party", "Casual"];
const AUDIENCE_OPTIONS = ["Gen Z", "Professionals", "Students"];

const ANGLE_URL_KEY: Record<StyleAngle, keyof StyleFormValues> = {
  front: "imageUrl",
  left: "leftImageUrl",
  right: "rightImageUrl",
  back: "backImageUrl",
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

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Card thumbnail
        </label>
        <p className="mt-1 text-xs text-muted">
          Which angle shows on the explore/recommendations grid, library, and history.
        </p>
        <div className="mt-2 flex gap-2">
          {STYLE_ANGLES.map(({ value, label }) => {
            const hasPhoto = !!values[ANGLE_URL_KEY[value]];
            const active = values.displayAngle === value;
            return (
              <button
                key={value}
                type="button"
                disabled={!hasPhoto}
                onClick={() => set("displayAngle", value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-accent text-white"
                    : hasPhoto
                      ? "bg-surface text-muted hover:bg-accent-light"
                      : "cursor-not-allowed bg-surface text-muted/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
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

      <Field label="Category" hint="e.g. Fade, Korean, Classic — the main browse filter">
        <input
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <SelectField
          label="Length category"
          value={values.lengthCategory}
          onChange={(v) => set("lengthCategory", v)}
          options={LENGTH_CATEGORY_OPTIONS}
        />
        <SelectField
          label="Maintenance"
          value={values.maintenance}
          onChange={(v) => set("maintenance", v)}
          options={MAINTENANCE_OPTIONS}
        />
        <SelectField
          label="Beard pairing"
          value={values.beardPairing}
          onChange={(v) => set("beardPairing", v)}
          options={BEARD_PAIRING_OPTIONS}
        />
      </div>

      <MultiSelectPills
        label="Hair texture compatibility"
        hint="A style that works on straight hair often looks different on curly"
        value={values.textureCompat}
        onChange={(v) => set("textureCompat", v)}
        options={TEXTURE_OPTIONS}
      />

      <MultiSelectPills
        label="Hair thickness / density"
        value={values.density}
        onChange={(v) => set("density", v)}
        options={DENSITY_OPTIONS}
      />

      <MultiSelectPills
        label="Occasion"
        value={values.occasion}
        onChange={(v) => set("occasion", v)}
        options={OCCASION_OPTIONS}
      />

      <MultiSelectPills
        label="Target audience"
        hint="Mostly for marketing/content"
        value={values.targetAudience}
        onChange={(v) => set("targetAudience", v)}
        options={AUDIENCE_OPTIONS}
      />

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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelectPills({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const selected = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(next.join(","));
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-muted hover:bg-accent-light"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
