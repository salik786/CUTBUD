import type { Prisma } from "@prisma/client";

export const ADMIN_SORT_FIELDS = [
  "name",
  "category",
  "lengthCategory",
  "trendScore",
  "updatedAt",
  "active",
] as const;
export type AdminSortField = (typeof ADMIN_SORT_FIELDS)[number];

export const FACE_SHAPE_OPTIONS = ["Oval", "Round", "Square", "Diamond", "Heart", "Long"];

export function buildAdminStyleWhere({
  q,
  category,
  model,
  faceShape,
  status,
}: {
  q?: string;
  category?: string;
  model?: string;
  faceShape?: string;
  status?: string;
}): Prisma.StyleCatalogWhereInput {
  const clauses: Prisma.StyleCatalogWhereInput[] = [];
  if (q) {
    clauses.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (category) clauses.push({ category });
  if (model) clauses.push({ modelId: model });
  if (faceShape) clauses.push({ faceShapeFit: { contains: faceShape, mode: "insensitive" } });
  if (status === "active") clauses.push({ active: true });
  if (status === "inactive") clauses.push({ active: false });

  return clauses.length ? { AND: clauses } : {};
}

export function buildAdminOrderBy(
  sort?: string,
  dir?: string
): Prisma.StyleCatalogOrderByWithRelationInput {
  const field: AdminSortField = (ADMIN_SORT_FIELDS as readonly string[]).includes(sort ?? "")
    ? (sort as AdminSortField)
    : "updatedAt";
  const direction: Prisma.SortOrder = dir === "asc" ? "asc" : "desc";
  return { [field]: direction };
}
