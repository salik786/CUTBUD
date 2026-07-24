"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";

export interface ShopFormValues {
  id?: string;
  name: string;
  address: string;
  active?: boolean;
}

export function ShopForm({ initial }: { initial?: ShopFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ShopFormValues>(
    initial ?? { name: "", address: "", active: true }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(values.id ? `/api/admin/shops/${values.id}` : "/api/admin/shops", {
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
      router.push("/admin/shops");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  const inputClass =
    "rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-accent";

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Name</span>
        <input
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Address</span>
        <input
          required
          value={values.address}
          onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
          className={inputClass}
        />
      </label>

      {values.id && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))}
          />
          Active (QR codes work)
        </label>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="w-40">
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Saving…" : values.id ? "Save Changes" : "Create Shop"}
        </PrimaryButton>
      </div>
    </form>
  );
}
