"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";

export function ShowToBarberButton({
  visitId,
  generationId,
}: {
  visitId: string;
  generationId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await fetch(`/api/visits/${visitId}/complete`, { method: "POST" });
    } finally {
      router.push(`/v/${visitId}/cut/${generationId}/after`);
    }
  }

  return (
    <PrimaryButton onClick={handle} disabled={loading}>
      {loading ? "Opening…" : "Show to Barber"}
    </PrimaryButton>
  );
}
