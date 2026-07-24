"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EntryStart({ entryQrToken }: { entryQrToken: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function start(destination: "intake" | "recommendations") {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryQrToken }),
      });
      if (!res.ok) throw new Error("failed");
      const { visit } = await res.json();
      router.push(`/v/${visit.id}/${destination}`);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-[#ff8fa3]">Something went wrong. Try again.</p>}
      <button
        onClick={() => start("intake")}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Starting…" : "Get Started"}
      </button>
      <button
        onClick={() => start("recommendations")}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Explore Hairstyles
      </button>
    </div>
  );
}
