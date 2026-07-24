"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ImageUploader } from "@/components/ImageUploader";

interface ProfileFormValues {
  name: string;
  address: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  website: string;
  openingHours: string;
}

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/barber/shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Logo</p>
          <ImageUploader value={values.logoUrl} onChange={(url) => set("logoUrl", url)} uploadUrl="/api/barber/upload" />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Cover Image</p>
          <ImageUploader
            value={values.coverImageUrl}
            onChange={(url) => set("coverImageUrl", url)}
            uploadUrl="/api/barber/upload"
          />
        </div>
      </div>

      <Field label="Shop Name">
        <input required value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
      </Field>

      <Field label="Address">
        <input
          required
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputClass} min-h-20`}
          placeholder="A quick line about your shop — style, vibe, specialty."
        />
      </Field>

      <Field label="Opening Hours">
        <input
          value={values.openingHours}
          onChange={(e) => set("openingHours", e.target.value)}
          className={inputClass}
          placeholder="Mon–Sat 10am–8pm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone">
          <input value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <input value={values.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Instagram">
          <input
            value={values.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            className={inputClass}
            placeholder="@yourshop"
          />
        </Field>
        <Field label="Facebook">
          <input value={values.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Website">
          <input value={values.website} onChange={(e) => set("website", e.target.value)} className={inputClass} />
        </Field>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Saved.</p>}

      <div className="mt-2 w-48">
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
