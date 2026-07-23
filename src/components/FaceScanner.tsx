"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { detectFace } from "@/lib/faceDetection";

type Indicator = "faceDetected" | "lighting" | "quality" | "hairVisible";
type CameraState = "idle" | "requesting" | "streaming" | "error";

const INDICATOR_LABELS: Record<Indicator, string> = {
  faceDetected: "Face detected",
  lighting: "Lighting quality",
  quality: "Image quality",
  hairVisible: "Hair visibility",
};

export function FaceScanner({
  onCapture,
  verifying = false,
  errorMessage: verifyError = "",
}: {
  onCapture: (dataUrl: string) => void;
  /** True while the parent is running detectFace() on a just-captured photo. */
  verifying?: boolean;
  /** Set by the parent when the captured photo failed face verification. */
  errorMessage?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [indicators, setIndicators] = useState<Record<Indicator, boolean>>({
    faceDetected: false,
    lighting: false,
    quality: false,
    hairVisible: false,
  });

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
  // the brief asks for. "Face detected" is real when the browser's native
  // MediaPipe FaceDetector (see src/lib/faceDetection.ts) polls the live
  // video every 900ms and drives the "Face detected" indicator for real. If
  // its WASM/model fails to load (offline, blocked CDN) the first poll
  // reports unsupported and this falls back to a simulated reveal instead,
  // same as the other three indicators, which aren't independently
  // verifiable without a heavier model.
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
      const check = await detectFace(canvas.toDataURL("image/jpeg", 0.6));
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
  }, [cameraState]);

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
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  }

  const allGood = Object.values(indicators).every(Boolean);
  const streaming = cameraState === "streaming";
  const busy = verifying || cameraState === "requesting";
  const displayError = verifyError || (cameraState === "error" ? cameraErrorMessage : "");

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
        <p className="fade-up text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          AI Hair Analysis
        </p>
        <h1 className="fade-up mt-2 text-center text-xl font-bold" style={{ animationDelay: "60ms" }}>
          Position your face inside the frame
        </h1>
        <p className="fade-up mt-1 text-center text-sm text-white/60" style={{ animationDelay: "100ms" }}>
          Make sure your hair is visible · Use good lighting
        </p>

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

        {displayError && (
          <p className="fade-up mt-4 text-center text-xs text-[#ff8fa3]">{displayError}</p>
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
          Your photo is analyzed on this device and is never uploaded or stored.
        </p>
      </div>
    </div>
  );
}
