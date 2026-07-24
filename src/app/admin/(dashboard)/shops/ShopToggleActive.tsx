"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ShopToggleActive({ shopId, active }: { shopId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await fetch(`/api/admin/shops/${shopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-border text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
