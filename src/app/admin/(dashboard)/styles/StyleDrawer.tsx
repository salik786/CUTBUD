"use client";

import { useEffect } from "react";
import type { StyleCatalog } from "@prisma/client";
import { StyleForm, styleToFormValues } from "./StyleForm";

export function StyleDrawer({ style, onClose }: { style: StyleCatalog; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Lock background scroll while the drawer is open, restore on close.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="fade-in-drawer relative h-full w-full max-w-3xl overflow-y-auto bg-page shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <h2 className="text-lg font-bold">{style.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-page"
          >
            ✕
          </button>
        </div>
        <div className="px-6 pb-10">
          <StyleForm initial={styleToFormValues(style)} onSaved={onClose} onCancel={onClose} onDeleted={onClose} />
        </div>
      </div>
    </div>
  );
}
