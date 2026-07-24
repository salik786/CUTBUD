"use client";

import { useState } from "react";

export function BarberLoginPanel({
  shopId,
  existingEmail,
}: {
  shopId: string;
  existingEmail: string | null;
}) {
  const [email, setEmail] = useState(existingEmail ?? "");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);

  async function createOrReset() {
    if (!email) return;
    setCreating(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/barber-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Barber Login</p>
      <p className="mt-1 text-xs text-muted">
        {existingEmail
          ? "This shop already has a login. Resetting generates a new password — the old one stops working immediately."
          : "Give this shop's owner their own login to /barber — they can edit their profile, pricing, and which styles they offer."}
      </p>

      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="barber@shop.com"
          className="flex-1 rounded-xl border border-border bg-page px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={createOrReset}
          disabled={creating || !email}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {creating ? "Working…" : existingEmail ? "Reset Password" : "Create Login"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-3 rounded-xl border border-accent/30 bg-accent-light p-3 text-sm">
          <p className="font-semibold text-accent">Save this now — the password won&apos;t be shown again.</p>
          <p className="mt-2">
            URL: <span className="font-mono">/barber/login</span>
          </p>
          <p>
            Email: <span className="font-mono">{result.email}</span>
          </p>
          <p>
            Password: <span className="font-mono">{result.password}</span>
          </p>
        </div>
      )}
    </div>
  );
}
