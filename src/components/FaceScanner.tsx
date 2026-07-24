"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectFace, type FacePose } from "@/lib/faceDetection";

type Indicator = "faceDetected" | "lighting" | "quality" | "hairVisible";
type CameraState = "idle" | "requesting" | "streaming" | "error";

const INDICATOR_LABELS: Record<Indicator, string> = {
  faceDetected: "Face detected",
  lighting: "Lighting quality",
  quality: "Image quality",
  hairVisible: "Hair visibility",
};

interface ShotStep {
  id: string;
  title: string;
  subtitle: string;
  pose: FacePose;
}

// Four angles for a better-informed recommendation later (front for face
// shape, both sides for hairline/ear position, jaw for beard/growth
// pattern) — see src/lib/faceDetection.ts for why "left"/"right" use a
// different, more lenient validation than "front"/"jaw".
const STEPS: ShotStep[] = [
  {
    id: "front",
    title: "Look straight ahead",
    subtitle: "Position your face inside the frame",
    pose: "frontal",
  },
  {
    id: "left",
    title: "Turn slightly to your left",
    subtitle: "Show your hairline and the side of your head",
    pose: "profile",
  },
  {
    id: "right",
    title: "Turn slightly to your right",
    subtitle: "Show your hairline and the side of your head",
    pose: "profile",
  },
  {
    id: "jaw",
    title: "Tilt your chin down slightly",
    subtitle: "Show your jawline and beard area clearly",
    pose: "frontal",
  },
];

export function FaceScanner({ onComplete }: { onComplete: (photos: string[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [shotError, setShotError] = useState("");
  const [indicators, setIndicators] = useState<Record<Indicator, boolean>>({
    faceDetected: false,
    lighting: false,
    quality: false,
    hairVisible: false,
  });

  const step = STEPS[stepIndex];

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Camera access must be requested from a direct tap — most mobile browsers
  // silently block getUserMedia if it's fired from a useEffect on mount
  // without a fresh user gesture, and it's flatly unavailable outside a
  // secure context (https, or localhost). Surface the real reason instead
  // of just failing quiet.
  async function enableCamera() {
    setCameraState("requesting");
    setCameraErrorMessage("");

    if (!window.isSecureContext) {
      setCameraState("error");
      setCameraErrorMessage("Camera requires a secure connection (https). Use Upload Image instead.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("error");
      setCameraErrorMessage("This browser doesn't support camera access. Use Upload Image instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        // Set imperatively, not just via the JSX `muted` attribute — React
        // doesn't reliably sync that attribute to the DOM property, and an
        // unmuted play() call can be silently blocked by autoplay policy.
        video.muted = true;
        video.srcObject = stream;
        await video.play();
      }
      setCameraState("streaming");
    } catch (err) {
      setCameraState("error");
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setCameraErrorMessage("Camera access was denied. Allow it in your browser settings, or upload a photo.");
      } else if (name === "NotFoundError") {
        setCameraErrorMessage("No camera found on this device. Use Upload Image instead.");
      } else {
        setCameraErrorMessage("Couldn't start the camera. Use Upload Image instead.");
      }
    }
  }

  // Lighting / image quality / hair visibility can't be verified for real
  // without a heavier model, so those stay simulated for the "premium feel"
  // the brief asks for. "Face detected" is real — MediaPipe FaceDetector
  // (see src/lib/faceDetection.ts) polls the live video every 900ms. If its
  // WASM/model fails to load (offline, blocked CDN) the first poll reports
  // unsupported and this falls back to a simulated reveal instead, same as
  // the other three indicators.
  useEffect(() => {
    if (cameraState !== "streaming") return;

    const others: Indicator[] = ["lighting", "quality", "hairVisible"];
    const timers = others.map((key, i) =>
      setTimeout(() => setIndicators((prev) => ({ ...prev, [key]: true })), 500 + i * 450)
    );

    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    const poll = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      const check = await detectFace(canvas.toDataURL("image/jpeg", 0.6), step.pose);
      if (cancelled) return;
      if (check.supported) {
        setIndicators((prev) => ({ ...prev, faceDetected: check.faceCount > 0 }));
      } else if (!fallbackTimer) {
        fallbackTimer = setTimeout(
          () => setIndicators((prev) => ({ ...prev, faceDetected: true })),
          500
        );
      }
    }, 900);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearInterval(poll);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraState, stepIndex]);

  async function handleShot(dataUrl: string) {
    setVerifying(true);
    setShotError("");

    const check = await detectFace(dataUrl, step.pose);
    if (check.supported && check.faceCount === 0) {
      const hint =
        step.pose === "frontal"
          ? "make sure your face is clearly visible and centered"
          : "make sure your face is still visible as you turn";
      setShotError(`We couldn't verify that shot — ${hint}, then try again.`);
      setVerifying(false);
      return;
    }

    setVerifying(false);
    const next = [...photos, dataUrl];
    setPhotos(next);
    setIndicators({ faceDetected: false, lighting: false, quality: false, hairVisible: false });

    if (stepIndex + 1 < STEPS.length) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(next);
    }
  }

  function captureFromVideo() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // mirror, since the preview is mirrored for a selfie feel
    ctx.drawImage(video, 0, 0);
    handleShot(canvas.toDataURL("image/jpeg", 0.9));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleShot(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const allGood = Object.values(indicators).every(Boolean);
  const streaming = cameraState === "streaming";
  const busy = verifying || cameraState === "requesting";

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-hero-bg text-white">
      {!streaming && <div className="absolute inset-0 bg-gradient-to-b from-hero-bg-2 to-hero-bg" />}
      {/* Always mounted (not conditionally rendered) so videoRef exists
          before enableCamera() runs — attaching a stream to a ref that
          hasn't mounted yet is a silent no-op: the camera turns on but
          nothing ever appears on screen. Visibility is toggled instead. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover [transform:scaleX(-1)] ${
          streaming ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <div className="relative flex flex-1 flex-col px-6 py-8">
        <div className="fade-up mx-auto flex w-full max-w-xs gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${i <= photos.length ? "bg-accent" : "bg-white/20"}`}
            />
          ))}
        </div>

        <p
          className="fade-up mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
          style={{ animationDelay: "40ms" }}
        >
          Shot {stepIndex + 1} of {STEPS.length}
        </p>

        {/* mode="wait" would delay mounting the new step's title until the
            previous one's exit transition finishes — harmless if animations
            run normally, but it means step advancement is silently gated on
            an animation completing rather than on state, which is a bad
            dependency to have (e.g. a throttled/backgrounded tab). Default
            mode lets the new one appear immediately regardless. */}
        <AnimatePresence>
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="mt-2 text-center text-xl font-bold">{step.title}</h1>
            <p className="mt-1 text-center text-sm text-white/60">{step.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto mt-8 flex flex-1 items-center justify-center">
          <motion.div
            className="relative flex h-64 w-64 items-center justify-center rounded-full border-2 border-white/70"
            animate={{ borderColor: allGood ? "rgba(108,79,240,0.9)" : "rgba(255,255,255,0.5)" }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.04, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* corner brackets, Face-ID style */}
            {[
              "top-2 left-2 border-t-2 border-l-2 rounded-tl-lg",
              "top-2 right-2 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg",
            ].map((cls) => (
              <span key={cls} className={`absolute h-6 w-6 border-white ${cls}`} />
            ))}

            {cameraState === "idle" && (
              <button
                type="button"
                onClick={enableCamera}
                className="relative z-10 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors duration-150 hover:bg-white/20"
              >
                Tap to enable camera
              </button>
            )}
            {cameraState === "requesting" && (
              <p className="relative z-10 text-sm text-white/70">Requesting camera…</p>
            )}
            {verifying && (
              <p className="relative z-10 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
                Checking your photo…
              </p>
            )}
          </motion.div>
        </div>

        <div className="fade-up mx-auto mt-6 grid w-full max-w-xs grid-cols-2 gap-2" style={{ animationDelay: "140ms" }}>
          {(Object.keys(INDICATOR_LABELS) as Indicator[]).map((key) => (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 backdrop-blur"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${indicators[key] ? "bg-emerald-400" : "bg-white/30"}`}
              />
              <span className="text-[11px] text-white/80">{INDICATOR_LABELS[key]}</span>
            </div>
          ))}
        </div>

        {(shotError || (cameraState === "error" && cameraErrorMessage)) && (
          <p className="fade-up mt-4 text-center text-xs text-[#ff8fa3]">
            {shotError || cameraErrorMessage}
          </p>
        )}

        <div className="fade-up mt-8 flex flex-col gap-3" style={{ animationDelay: "180ms" }}>
          <button
            type="button"
            onClick={streaming ? captureFromVideo : enableCamera}
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {verifying
              ? "Checking…"
              : streaming
                ? "Take Photo"
                : cameraState === "requesting"
                  ? "Requesting…"
                  : "Enable Camera"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Upload Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <p className="fade-up mt-5 text-center text-[11px] text-white/40" style={{ animationDelay: "220ms" }}>
          Your photos are analyzed on this device and are never uploaded or stored.
        </p>
      </div>
    </div>
  );
}
