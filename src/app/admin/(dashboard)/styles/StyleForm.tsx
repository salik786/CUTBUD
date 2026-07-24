"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StyleCatalog } from "@prisma/client";
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
  frontPrompt: string;
  leftPrompt: string;
  rightPrompt: string;
  backPrompt: string;
  tryonPrompt: string;
  modelId: string;
  trendScore: string;
  featured: boolean;
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
  frontPrompt: "",
  leftPrompt: "",
  rightPrompt: "",
  backPrompt: "",
  tryonPrompt: "",
  modelId: "",
  trendScore: "",
  featured: false,
  active: true,
};

// Shared by the [id] edit page and the table's side drawer so the Prisma
// row -> form-values mapping (all fields are strings here, even nullable
// DB ones) can't drift between the two entry points.
export function styleToFormValues(style: StyleCatalog): StyleFormValues {
  return {
    id: style.id,
    name: style.name,
    description: style.description,
    basePrompt: style.basePrompt,
    faceShapeFit: style.faceShapeFit,
    guardNumber: style.guardNumber ?? "",
    lengthMm: style.lengthMm ?? "",
    fadeType: style.fadeType ?? "",
    category: style.category ?? "",
    textureCompat: style.textureCompat ?? "",
    density: style.density ?? "",
    lengthCategory: style.lengthCategory ?? "",
    maintenance: style.maintenance ?? "",
    beardPairing: style.beardPairing ?? "",
    occasion: style.occasion ?? "",
    targetAudience: style.targetAudience ?? "",
    imageUrl: style.imageUrl ?? "",
    leftImageUrl: style.leftImageUrl ?? "",
    rightImageUrl: style.rightImageUrl ?? "",
    backImageUrl: style.backImageUrl ?? "",
    displayAngle: style.displayAngle,
    inspiredBy: style.inspiredBy ?? "",
    frontPrompt: style.frontPrompt ?? "",
    leftPrompt: style.leftPrompt ?? "",
    rightPrompt: style.rightPrompt ?? "",
    backPrompt: style.backPrompt ?? "",
    tryonPrompt: style.tryonPrompt ?? "",
    modelId: style.modelId ?? "",
    trendScore: style.trendScore != null ? String(style.trendScore) : "",
    featured: style.featured,
    active: style.active,
  };
}

const TEXTURE_OPTIONS = ["Straight", "Wavy", "Curly", "Coily"];
const DENSITY_OPTIONS = ["Thin", "Medium", "Thick"];
const LENGTH_CATEGORY_OPTIONS = ["Very Short", "Short", "Medium", "Long"];
const MAINTENANCE_OPTIONS = ["Low", "Medium", "High"];
const BEARD_PAIRING_OPTIONS = ["None", "Optional", "Required"];
const OCCASION_OPTIONS = ["Daily", "Professional", "Party", "Casual"];
const AUDIENCE_OPTIONS = ["Gen Z", "Professionals", "Students"];

const ANGLE_URL_KEY: Record<StyleAngle, "imageUrl" | "leftImageUrl" | "rightImageUrl" | "backImageUrl"> = {
  front: "imageUrl",
  left: "leftImageUrl",
  right: "rightImageUrl",
  back: "backImageUrl",
};

const ANGLE_PROMPT_KEY: Record<StyleAngle, "frontPrompt" | "leftPrompt" | "rightPrompt" | "backPrompt"> = {
  front: "frontPrompt",
  left: "leftPrompt",
  right: "rightPrompt",
  back: "backPrompt",
};

export function StyleForm({
  initial,
  onSaved,
  onCancel,
  onDeleted,
}: {
  initial?: StyleFormValues;
  /** Provided when embedded in the table's side drawer instead of a standalone page. */
  onSaved?: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
}) {
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
        body: JSON.stringify({ ...values, trendScore: values.trendScore === "" ? null : Number(values.trendScore) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSaving(false);
        return;
      }
      if (onSaved) {
        onSaved();
      } else {
        router.push("/admin/styles");
      }
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
    if (onDeleted) {
      onDeleted();
    } else {
      router.push("/admin/styles");
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-3xl flex-col gap-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">Photos</label>
        <p className="mt-1 text-xs text-muted">
          Generate each angle in Higgsfield using the prompt shown, then upload the result here.
          Left/right/back prompts reference the front image so the same model/haircut stays
          consistent across all 4 angles. Only Front is required — any angle left empty shows as
          pending on the cut card.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {STYLE_ANGLES.map(({ value, label }) => (
            <div key={value} className="flex gap-4 rounded-xl border border-border bg-surface p-3">
              <div className="w-32 shrink-0">
                <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
                <ImageUploader
                  value={values[ANGLE_URL_KEY[value]]}
                  onChange={(url) => set(ANGLE_URL_KEY[value], url)}
                />
              </div>
              <PromptField
                value={values[ANGLE_PROMPT_KEY[value]]}
                onChange={(v) => set(ANGLE_PROMPT_KEY[value], v)}
              />
            </div>
          ))}
        </div>
      </div>

      <PromptField label="Try-on prompt (customer selfie)" value={values.tryonPrompt} onChange={(v) => set("tryonPrompt", v)} />

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

      <div className="grid grid-cols-2 gap-3">
        <Field label="Model ID" hint="Higgsfield model persona, e.g. MODEL003">
          <input
            value={values.modelId}
            onChange={(e) => set("modelId", e.target.value)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
          />
        </Field>
        <Field label="Trend score" hint="0-100, used for sorting in admin">
          <input
            type="number"
            min={0}
            max={100}
            value={values.trendScore}
            onChange={(e) => set("trendScore", e.target.value)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <div className="w-48">
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving…" : values.id ? "Save Changes" : "Create Style"}
          </PrimaryButton>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-muted hover:underline"
          >
            Cancel
          </button>
        )}
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

function PromptField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied/unavailable — select the text instead
      // so the user can still copy it manually (Cmd/Ctrl+C).
      textareaRef.current?.select();
    }
  }

  return (
    <div className="flex-1">
      <div className="mb-1.5 flex items-center justify-between">
        {label && <p className="text-xs font-semibold text-muted">{label}</p>}
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className="ml-auto rounded-full border border-border bg-page px-2.5 py-1 text-xs font-medium text-muted hover:bg-accent-light disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="No prompt synced for this angle yet"
        className="min-h-24 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs leading-relaxed text-ink/80 outline-none focus:border-accent"
      />
    </div>
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
