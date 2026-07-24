"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeUserImage, type HairAnalysisResult } from "@/services/hairAnalysis";

interface Step {
  title: string;
  checks: string[];
}

const STEPS: Step[] = [
  { title: "Analyzing face structure", checks: ["Face detected"] },
  { title: "Calculating face shape", checks: ["Measuring facial proportions"] },
  { title: "Analyzing hair characteristics", checks: ["Hair density", "Hair texture", "Hair volume"] },
  { title: "Analyzing style compatibility", checks: ["Matching hairstyles"] },
];

const STEP_DURATION_MS = 1600; // 4 steps * 1.6s ≈ 6.4s, inside the 5-8s target

// Landmark points scattered over the face area for the tracking-dot effect.
const LANDMARKS = Array.from({ length: 18 }, (_, i) => ({
  x: 20 + ((i * 37) % 60),
  y: 15 + ((i * 53) % 70),
  delay: (i % 6) * 0.12,
}));

export function AIAnalysisAnimation({
  photo,
  allPhotos,
  onComplete,
}: {
  photo: string;
  /** All captured angles (front/left/right/jaw) — analyzeUserImage uses the
   * full set; only `photo` (front) is shown in the scanning visual. */
  allPhotos?: string[];
  onComplete: (result: HairAnalysisResult) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEP_DURATION_MS);

    const totalMs = STEP_DURATION_MS * STEPS.length;
    const start = Date.now();
    const progressTimer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / totalMs) * 100));
      setProgress(pct);
    }, 80);

    let cancelled = false;
    (async () => {
      const result = await analyzeUserImage(allPhotos && allPhotos.length > 0 ? allPhotos : photo);
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, totalMs - elapsed);
      setTimeout(() => {
        if (!cancelled) onComplete(result);
      }, remaining);
    })();

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-hero-bg px-6 py-10 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        AI Hair Analysis
      </p>

      <div className="relative mt-8 h-72 w-72 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="h-full w-full rounded-3xl object-cover" />

        {/* face outline tracking ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-accent/70"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* horizontal scan line */}
        <motion.div
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
          initial={{ top: "5%" }}
          animate={{ top: ["5%", "95%", "5%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />

        {/* landmark points */}
        {LANDMARKS.map((p, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(108,79,240,0.9)]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ opacity: [0, 1, 0.6, 1], scale: [0.6, 1, 0.9, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

        {/* jawline + forehead measurement lines */}
        <motion.div
          className="absolute inset-x-6 top-[18%] h-px bg-white/40"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-x-10 bottom-[15%] h-px bg-white/40"
          style={{ borderRadius: 999 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
      </div>

      {allPhotos && allPhotos.length > 1 && (
        <div className="mt-3 flex gap-2">
          {allPhotos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={p}
              alt=""
              className={`h-10 w-10 rounded-lg object-cover ${p === photo ? "opacity-100 ring-2 ring-accent" : "opacity-50"}`}
            />
          ))}
        </div>
      )}

      {/* progress ring + percentage */}
      <div className="mt-8 flex items-center gap-3">
        <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
          <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
          <motion.circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 19}
            animate={{ strokeDashoffset: 2 * Math.PI * 19 * (1 - progress / 100) }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </svg>
        <span className="tabular text-lg font-semibold">{progress}%</span>
      </div>

      <div className="mt-6 w-full max-w-sm">
        {/* Default mode, not "wait" — the step index is driven by a plain
            setInterval, so the next step's text must appear immediately
            regardless of whether the previous card's exit transition has
            actually finished. */}
        <AnimatePresence>
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            <p className="font-semibold">{STEPS[stepIndex].title}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {STEPS[stepIndex].checks.map((check) => (
                <li key={check} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="text-emerald-400">✓</span>
                  {check}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
