export type StyleAngle = "front" | "left" | "right" | "back";

export const STYLE_ANGLES: { value: StyleAngle; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "back", label: "Back" },
];

type StyleWithAngles = {
  imageUrl?: string | null;
  leftImageUrl?: string | null;
  rightImageUrl?: string | null;
  backImageUrl?: string | null;
  displayAngle?: string | null;
};

function angleUrl(style: StyleWithAngles, angle: StyleAngle): string | null | undefined {
  switch (angle) {
    case "front":
      return style.imageUrl;
    case "left":
      return style.leftImageUrl;
    case "right":
      return style.rightImageUrl;
    case "back":
      return style.backImageUrl;
  }
}

// The card thumbnail everywhere (recommendations grid, library, history,
// marketing mockups) — admin picks which angle represents the style best.
// Falls back through the other angles if the chosen one has no photo yet.
export function getDisplayImageUrl(style: StyleWithAngles): string | null | undefined {
  const chosen = (style.displayAngle as StyleAngle) || "front";
  const primary = angleUrl(style, chosen);
  if (primary) return primary;

  for (const { value } of STYLE_ANGLES) {
    const url = angleUrl(style, value);
    if (url) return url;
  }
  return null;
}
