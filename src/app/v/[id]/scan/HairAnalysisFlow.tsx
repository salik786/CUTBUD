"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaceScanner } from "@/components/FaceScanner";
import { AIAnalysisAnimation } from "@/components/AIAnalysisAnimation";
import { FaceMetricsCard } from "@/components/FaceMetricsCard";
import { HairAnalysisCard } from "@/components/HairAnalysisCard";
import { RecommendationScore } from "@/components/RecommendationScore";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";
import { detectFace } from "@/lib/faceDetection";
import type { HairAnalysisResult } from "@/services/hairAnalysis";

type Phase = "capture" | "verifying" | "analyzing" | "results";

export function HairAnalysisFlow({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState("");
  const [result, setResult] = useState<HairAnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCapture(dataUrl: string) {
    setPhoto(dataUrl);
    setCaptureError("");
    setPhase("verifying");

    const check = await detectFace(dataUrl);
    if (check.supported && check.faceCount === 0) {
      setCaptureError("We couldn't detect a face in that photo — make sure your face is clearly visible and centered, then try again.");
      setPhase("capture");
      return;
    }

    setPhase("analyzing");
  }

  if (phase === "capture" || phase === "verifying") {
    return (
      <FaceScanner
        onCapture={handleCapture}
        verifying={phase === "verifying"}
        errorMessage={captureError}
      />
    );
  }

  if (phase === "analyzing" && photo) {
    return (
      <AIAnalysisAnimation
        photo={photo}
        onComplete={(r) => {
          setResult(r);
          setPhase("results");
        }}
      />
    );
  }

  if (phase === "results" && result) {
    async function seeRecommendations() {
      setSaving(true);
      try {
        await fetch("/api/hair-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitId, ...result }),
        });
      } finally {
        router.push(`/v/${visitId}/recommendations?faceShape=${result!.faceShape}`);
      }
    }

    return (
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 py-8">
        <BackLink href={`/v/${visitId}/intake`} />

        <p className="fade-up mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Analysis complete
        </p>
        <h1 className="fade-up mt-1 text-center text-2xl font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
          Here&apos;s what we found
        </h1>

        <div className="fade-up mt-6 flex flex-col gap-4" style={{ animationDelay: "100ms" }}>
          <FaceMetricsCard result={result} />
          <HairAnalysisCard result={result} />
          <RecommendationScore result={result} />
        </div>

        <div className="fade-up mt-7" style={{ animationDelay: "160ms" }}>
          <PrimaryButton onClick={seeRecommendations} disabled={saving}>
            {saving ? "Loading…" : "See My Recommended Styles"}
          </PrimaryButton>
        </div>
      </main>
    );
  }

  return null;
}
