"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function continueWith(provider: string) {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/stub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (visitId) {
        const visitRes = await fetch(`/api/visits/${visitId}`).catch(() => null);
        if (visitRes?.ok) {
          const { visit } = await visitRes.json();
          if (visit.selectedGenerationId) {
            await fetch("/api/users/me/locker", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                styleGenerationId: visit.selectedGenerationId,
                shopId: visit.shopId,
              }),
            });
          }
        }
      }

      router.push("/me/library");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-7 flex flex-col gap-3">
      <div className="fade-up" style={{ animationDelay: "120ms" }}>
        <SecondaryButton onClick={() => continueWith("google")} disabled={loading}>
          Continue with Google
        </SecondaryButton>
      </div>
      <div className="fade-up" style={{ animationDelay: "160ms" }}>
        <SecondaryButton onClick={() => continueWith("apple")} disabled={loading}>
          Continue with Apple
        </SecondaryButton>
      </div>

      <div className="fade-up my-1 flex items-center gap-3 text-xs text-muted" style={{ animationDelay: "200ms" }}>
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        className="fade-up rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] outline-none focus:border-accent"
        style={{ animationDelay: "240ms" }}
      />
      <div className="fade-up" style={{ animationDelay: "280ms" }}>
        <PrimaryButton onClick={() => continueWith("email")} disabled={loading || !email}>
          Continue
        </PrimaryButton>
      </div>

      <p className="fade-up mt-1 text-center text-sm text-muted" style={{ animationDelay: "320ms" }}>
        Already have an account? <span className="font-semibold text-accent">Log in</span>
      </p>
    </div>
  );
}
