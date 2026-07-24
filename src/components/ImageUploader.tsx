"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ImageUploader({
  value,
  onChange,
  uploadUrl = "/api/admin/upload",
}: {
  value: string;
  onChange: (url: string) => void;
  uploadUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-page">
        {value && <Image src={value} alt="" fill className="object-cover" sizes="180px" />}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold hover:bg-page disabled:opacity-50"
      >
        {uploading ? "Uploading…" : value ? "Replace Image" : "Upload Image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
