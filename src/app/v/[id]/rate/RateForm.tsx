"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/StarRating";
import { PrimaryButton } from "@/components/PrimaryButton";

export function RateForm({ visitId, shopId }: { visitId: string; shopId: string }) {
  const router = useRouter();
  const [recommend, setRecommend] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const stars = Number(form.get("haircut") || 5);

    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, shopId, stars, comment }),
      });
    } finally {
      router.push(`/v/${visitId}/save`);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-6">
      <div className="fade-up rounded-2xl border border-border bg-surface p-4" style={{ animationDelay: "140ms" }}>
        <p className="text-sm font-semibold">Rate the Haircut</p>
        <div className="mt-2">
          <StarRating name="haircut" defaultValue={5} />
        </div>

        <p className="mt-5 text-sm font-semibold">Rate the Barber</p>
        <div className="mt-2">
          <StarRating name="barber" defaultValue={5} />
        </div>

        <p className="mt-5 text-sm font-semibold">Would you recommend this barber?</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setRecommend("up")}
            aria-pressed={recommend === "up"}
            className={`flex h-10 w-14 items-center justify-center rounded-xl border transition-colors duration-150 ${
              recommend === "up" ? "border-accent bg-accent text-white" : "border-border bg-page text-muted"
            }`}
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => setRecommend("down")}
            aria-pressed={recommend === "down"}
            className={`flex h-10 w-14 items-center justify-center rounded-xl border transition-colors duration-150 ${
              recommend === "down" ? "border-accent bg-accent text-white" : "border-border bg-page text-muted"
            }`}
          >
            👎
          </button>
        </div>

        <p className="mt-5 text-sm font-semibold">Any comments? (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-2 min-h-20 w-full rounded-xl border border-border bg-page p-3 text-sm outline-none focus:border-accent"
          placeholder="Great attention to detail. Loved the fade!"
        />
      </div>

      <div className="fade-up" style={{ animationDelay: "200ms" }}>
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Saving…" : "Finish"}
        </PrimaryButton>
      </div>
    </form>
  );
}
