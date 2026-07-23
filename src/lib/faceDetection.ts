/**
 * Real (not simulated) face-presence check, using MediaPipe Tasks Vision's
 * FaceDetector running entirely client-side via WASM — the photo never
 * leaves the browser.
 *
 * This is intentionally the only "real" computer vision in the app today.
 * `hairAnalysis.ts`'s `analyzeUserImage` is a full mock and does NOT look at
 * pixels at all — this check exists specifically to stop that mock from
 * running on a photo with no usable face in it: not just "zero faces
 * detected" but also faces that are too small/far, too low-confidence, or
 * at an extreme angle (chin tilted back, looking away) where a hairstyle
 * recommendation wouldn't make sense anyway. A bare "faceCount > 0" check
 * was too lenient — BlazeFace still scores a tilted-back, mostly-neck shot
 * as *a* face — so this adds geometric sanity checks on top of the raw
 * detection.
 *
 * The WASM runtime + model (~200KB, short-range detector) load lazily from
 * Google's public MediaPipe CDN on first use and are cached for the rest of
 * the session — there's a brief delay (shown as "Checking your photo…") the
 * first time a user runs this.
 *
 * When real face-shape/hair analysis is eventually wired up (see
 * hairAnalysis.ts), it can reuse this same MediaPipe Tasks Vision package —
 * FaceLandmarker (468 landmarks) is the natural next step from FaceDetector,
 * and would let these heuristics be replaced with a real pose/angle check.
 */

import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

// BlazeFace keypoint order: 0 rightEye, 1 leftEye, 2 noseTip, 3 mouthCenter,
// 4 rightEarTragion, 5 leftEarTragion (normalized 0-1 coordinates).
const KP_RIGHT_EYE = 0;
const KP_LEFT_EYE = 1;
const KP_NOSE = 2;
const KP_MOUTH = 3;

const MIN_SCORE = 0.8;
const MIN_FACE_HEIGHT_FRACTION = 0.15; // face must fill a reasonable amount of the frame
const MIN_EYE_SEPARATION_FRACTION = 0.28; // relative to bounding box width
const MAX_YAW_ASYMMETRY = 1.6; // max ratio between nose-to-each-eye distances before rejecting as turned

export type FaceCheckResult =
  | { supported: true; faceCount: number }
  | { supported: false; faceCount: null };

let detectorPromise: Promise<FaceDetector> | null = null;

function getDetector(): Promise<FaceDetector> {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(WASM_BASE).then((fileset) =>
      FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        minDetectionConfidence: MIN_SCORE,
      })
    );
  }
  return detectorPromise;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for face detection"));
    img.src = dataUrl;
  });
}

/**
 * Beyond "a face was detected somewhere": is this a usable, roughly
 * front-facing shot? Rejects faces that are too small/distant, faces tilted
 * back (chin toward camera, eyes/nose/mouth no longer in normal vertical
 * order), and — the case a plain eye-separation check missed — faces
 * *turned* left or right. BlazeFace still places two plausible-looking eye
 * keypoints even on a profile/three-quarter shot, so a simple "are two eyes
 * present and spread apart" check isn't enough; this adds a yaw check
 * (nose-to-each-eye horizontal distance should be roughly symmetric on a
 * face actually looking at the camera — a turned head makes it lopsided).
 */
function isUsableFace(
  detection: ReturnType<FaceDetector["detect"]>["detections"][number],
  imageWidth: number,
  imageHeight: number
): boolean {
  const score = detection.categories[0]?.score ?? 0;
  if (score < MIN_SCORE) return false;

  const box = detection.boundingBox;
  if (!box) return false;
  if (box.height / imageHeight < MIN_FACE_HEIGHT_FRACTION) return false;

  const kp = detection.keypoints;
  if (!kp || kp.length < 4) return false;

  const rightEye = kp[KP_RIGHT_EYE];
  const leftEye = kp[KP_LEFT_EYE];
  const nose = kp[KP_NOSE];
  const mouth = kp[KP_MOUTH];
  if (!rightEye || !leftEye || !nose || !mouth) return false;

  // Keypoints are normalized [0,1] relative to image width/height; the
  // bounding box is in pixel space — convert eye separation to pixels
  // before comparing against it, rather than mixing units.
  const eyeSeparationPx = Math.abs(leftEye.x - rightEye.x) * imageWidth;
  if (eyeSeparationPx < box.width * MIN_EYE_SEPARATION_FRACTION) return false;

  // Normal frontal geometry: eyes above nose, nose above mouth (in
  // normalized y). A head tilted back (chin toward camera) or turned away
  // collapses or reverses this ordering.
  const eyeY = (rightEye.y + leftEye.y) / 2;
  const margin = 0.01;
  if (!(eyeY < nose.y - margin && nose.y < mouth.y - margin / 2)) return false;

  // Yaw check: on a face actually facing the camera, the nose sits roughly
  // midway between the eyes horizontally. A left/right turn pushes it much
  // closer to one eye than the other.
  const noseToRightEyeX = Math.abs(nose.x - rightEye.x);
  const noseToLeftEyeX = Math.abs(nose.x - leftEye.x);
  const smaller = Math.min(noseToRightEyeX, noseToLeftEyeX);
  const larger = Math.max(noseToRightEyeX, noseToLeftEyeX);
  if (smaller < 1e-6 || larger / smaller > MAX_YAW_ASYMMETRY) return false;

  return true;
}

export async function detectFace(imageDataUrl: string): Promise<FaceCheckResult> {
  if (typeof window === "undefined") {
    return { supported: false, faceCount: null };
  }

  try {
    const [detector, img] = await Promise.all([getDetector(), loadImage(imageDataUrl)]);
    const result = detector.detect(img);
    const usableCount = result.detections.filter((d) => isUsableFace(d, img.width, img.height)).length;
    return { supported: true, faceCount: usableCount };
  } catch {
    // WASM/model failed to load (offline, blocked CDN, unsupported
    // environment) — different from "no face found". Treat as unverifiable
    // rather than as a hard rejection so a network hiccup never blocks the
    // whole flow.
    return { supported: false, faceCount: null };
  }
}
