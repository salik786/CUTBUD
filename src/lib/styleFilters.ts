import type { Prisma } from "@prisma/client";

// Shared by the recommendations page (initial SSR fetch) and the
// /api/styles/recommendations route (pagination + search) so filter/search
// behavior can't drift between the two.
function keywordClause(keyword: string): Prisma.StyleCatalogWhereInput {
  return {
    OR: [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { fadeType: { contains: keyword, mode: "insensitive" } },
      { faceShapeFit: { contains: keyword, mode: "insensitive" } },
      { inspiredBy: { contains: keyword, mode: "insensitive" } },
      { category: { contains: keyword, mode: "insensitive" } },
      { textureCompat: { contains: keyword, mode: "insensitive" } },
      { density: { contains: keyword, mode: "insensitive" } },
      { lengthCategory: { contains: keyword, mode: "insensitive" } },
      { maintenance: { contains: keyword, mode: "insensitive" } },
      { beardPairing: { contains: keyword, mode: "insensitive" } },
      { occasion: { contains: keyword, mode: "insensitive" } },
      { targetAudience: { contains: keyword, mode: "insensitive" } },
    ],
  };
}

export function buildStyleWhere({
  faceShape,
  filter,
  q,
}: {
  faceShape?: string;
  filter?: string;
  q?: string;
}): Prisma.StyleCatalogWhereInput {
  const clauses: Prisma.StyleCatalogWhereInput[] = [];
  if (faceShape) clauses.push({ faceShapeFit: { contains: faceShape, mode: "insensitive" } });
  if (filter) clauses.push(keywordClause(filter));
  if (q) clauses.push(keywordClause(q));

  return clauses.length ? { active: true, AND: clauses } : { active: true };
}

// Category pills shown above the grid — kept to terms that actually appear
// in style names/fade types/face-shape tags today, so no pill is a dead end.
export const STYLE_FILTERS = [
  { label: "All", keyword: "" },
  { label: "Skin Fade", keyword: "skin fade" },
  { label: "Taper Fade", keyword: "taper fade" },
  { label: "Undercut", keyword: "undercut" },
  { label: "Pompadour", keyword: "pompadour" },
  { label: "Buzz Cut", keyword: "buzz cut" },
  { label: "Curly", keyword: "curly" },
  { label: "Crop", keyword: "crop" },
];
