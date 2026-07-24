"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function GenerateStyleLink({
  visitId,
  styleCatalogId,
  children,
}: {
  visitId: string;
  styleCatalogId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function go() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/style-generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, styleCatalogId }),
      });
      const { generation } = await res.json();
      router.push(`/v/${visitId}/cut/${generation.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={loading}
      className="relative block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
    >
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
    </button>
  );
}
