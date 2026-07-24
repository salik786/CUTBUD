"use client";

import type { ReactNode } from "react";
import { useGenerateStyle } from "./useGenerateStyle";

export function GenerateStyleLink({
  visitId,
  styleCatalogId,
  children,
}: {
  visitId: string;
  styleCatalogId: string;
  children: ReactNode;
}) {
  const { generate, loading } = useGenerateStyle(visitId);

  return (
    <button
      type="button"
      onClick={() => generate(styleCatalogId)}
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
