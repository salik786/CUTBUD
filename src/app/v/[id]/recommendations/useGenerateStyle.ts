"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Shared by GenerateStyleLink (grid) and SwipeDeck ("View details") so both
// entry points create a StyleGeneration and navigate the same way.
export function useGenerateStyle(visitId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate(styleCatalogId: string) {
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

  return { generate, loading };
}
