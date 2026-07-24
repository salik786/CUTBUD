"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/barber/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/barber");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent"
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="mt-2">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </PrimaryButton>
      </div>
      <p className="mt-1 text-center text-xs text-muted">
        Don&apos;t have a login yet? Ask CutBuddy to set one up for your shop.
      </p>
    </form>
  );
}
