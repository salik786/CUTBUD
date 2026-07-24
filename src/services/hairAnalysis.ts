/**
 * AI Hair Analysis service.
 *
 * This is the single integration point for real computer-vision models.
 * `analyzeUserImage` currently returns a plausible, internally-consistent
 * mock profile — no image data ever leaves the browser. When a real model
 * is wired up, replace the body of this function only; the return shape
 * (HairAnalysisResult) is the contract the rest of the app depends on.
 *
 * Planned integration:
 * - Face detection / 468 landmarks: MediaPipe Face Mesh (client-side, so the
 *   selfie still never has to leave the device — matches the privacy
 *   commitment made in Section 8 of the product spec).
 * - Face shape from landmarks: width/height/jaw/forehead/cheekbone ratios
 *   computed from the landmark set, classified into oval/round/square/
 *   rectangle/heart/diamond.
 * - Hair segmentation: MediaPipe Selfie Segmentation or a DeepLab/YOLO
 *   segmentation model, to derive hair boundary, density, and volume.
 */

export type FaceShape = "Oval" | "Round" | "Square" | "Rectangle" | "Heart" | "Diamond";

export interface HairAnalysisResult {
  faceShape: FaceShape;
  confidence: number; // 0-100
  faceLength: string;
  jawline: string;
  forehead: string;

  hairType: string;
  hairDensity: string;
  hairThickness: string;
  hairline: string;
  hairTexture: string;
  hairDirection: string;
  hairVolume: string;

  recommendedStyles: string[];
  avoidStyles: string[];
}

// Keyed by face shape so recommendations stay internally consistent —
// mirrors how a real classifier's output would drive a style-fit lookup.
const PROFILE_BY_FACE_SHAPE: Record<FaceShape, Omit<HairAnalysisResult, "confidence">> = {
  Oval: {
    faceShape: "Oval",
    faceLength: "Long",
    jawline: "Soft",
    forehead: "Medium",
    hairType: "Straight",
    hairDensity: "Medium",
    hairThickness: "Fine",
    hairline: "Normal",
    hairTexture: "Smooth",
    hairDirection: "Forward growth",
    hairVolume: "Medium",
    recommendedStyles: ["Low fade", "Textured crop", "Side part", "Medium length styles"],
    avoidStyles: ["Very high volume styles", "Extremely long hairstyles"],
  },
  Round: {
    faceShape: "Round",
    faceLength: "Short",
    jawline: "Rounded",
    forehead: "Wide",
    hairType: "Wavy",
    hairDensity: "Medium",
    hairThickness: "Medium",
    hairline: "Normal",
    hairDirection: "Upward growth",
    hairTexture: "Textured",
    hairVolume: "High on top",
    recommendedStyles: ["Skin fade with volume on top", "Angular fringe", "Pompadour"],
    avoidStyles: ["Rounded buzz cuts", "Center parts"],
  },
  Square: {
    faceShape: "Square",
    faceLength: "Medium",
    jawline: "Strong",
    forehead: "Medium",
    hairType: "Straight",
    hairDensity: "High",
    hairThickness: "Coarse",
    hairline: "Straight",
    hairDirection: "Back growth",
    hairTexture: "Smooth",
    hairVolume: "Medium",
    recommendedStyles: ["Textured crop", "Slick back undercut", "Side part"],
    avoidStyles: ["Blunt fringes", "Very short buzz cuts"],
  },
  Rectangle: {
    faceShape: "Rectangle",
    faceLength: "Long",
    jawline: "Angular",
    forehead: "Tall",
    hairType: "Straight",
    hairDensity: "Medium",
    hairThickness: "Medium",
    hairline: "Normal",
    hairDirection: "Forward growth",
    hairTexture: "Textured",
    hairVolume: "Low to medium",
    recommendedStyles: ["Fringe with texture", "Medium length styles", "Low fade"],
    avoidStyles: ["Very tall pompadours", "Extremely short sides"],
  },
  Heart: {
    faceShape: "Heart",
    faceLength: "Medium",
    jawline: "Narrow",
    forehead: "Wide",
    hairType: "Curly",
    hairDensity: "Medium",
    hairThickness: "Fine",
    hairline: "Widow's peak",
    hairDirection: "Forward growth",
    hairTexture: "Textured",
    hairVolume: "Medium",
    recommendedStyles: ["Curly crop with fade", "Side-swept fringe", "Textured crop"],
    avoidStyles: ["Heavy volume on top", "Slicked back styles"],
  },
  Diamond: {
    faceShape: "Diamond",
    faceLength: "Medium",
    jawline: "Angular",
    forehead: "Narrow",
    hairType: "Straight",
    hairDensity: "Medium",
    hairThickness: "Medium",
    hairline: "Normal",
    hairDirection: "Back growth",
    hairTexture: "Smooth",
    hairVolume: "Medium",
    recommendedStyles: ["Slick back undercut", "Side part", "Textured crop"],
    avoidStyles: ["Very high volume on top", "Center parts"],
  },
};

const FACE_SHAPES = Object.keys(PROFILE_BY_FACE_SHAPE) as FaceShape[];

/**
 * Deterministic-ish pseudo-random pick so repeated analyses of the "same"
 * capture in a session feel stable rather than jarring, while still varying
 * capture to capture. Replace with a real classifier call.
 */
function pickFaceShape(seed: number): FaceShape {
  return FACE_SHAPES[seed % FACE_SHAPES.length];
}

export async function analyzeUserImage(
  image: Blob | string | (Blob | string)[]
): Promise<HairAnalysisResult> {
  // Simulates model inference latency — real integration replaces this
  // with the actual async model call(s) across all captured angles (front,
  // left, right, jaw — see FaceScanner). The mock only uses their combined
  // size as a seed; a real model would use each angle for something
  // specific (sides for hairline, jaw for beard/growth pattern).
  await new Promise((resolve) => setTimeout(resolve, 400));

  const images = Array.isArray(image) ? image : [image];
  const seed = images.reduce(
    (sum, img) => sum + (typeof img === "string" ? img.length : Math.round(img.size)),
    0
  );
  const faceShape = pickFaceShape(seed);
  const confidence = 88 + (seed % 10); // 88-97%, reads as "confident" without ever being 100%

  return {
    ...PROFILE_BY_FACE_SHAPE[faceShape],
    confidence,
  };
}
