import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE_DEFAULT = 6;
const PAGE_SIZE_MAX = 24;

// Style catalog changes rarely (admin-managed) — cache each distinct
// page/filter combination for a short window instead of hitting Postgres
// on every request, without risking noticeably stale data after an edit.
export const revalidate = 30;

async function fetchPage(where: Record<string, unknown>, page: number, pageSize: number) {
  const [styles, total] = await Promise.all([
    prisma.styleCatalog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.styleCatalog.count({ where }),
  ]);
  return { styles, total };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const faceShape = searchParams.get("faceShape");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT)
  );

  const matchedWhere = faceShape
    ? { active: true, faceShapeFit: { contains: faceShape, mode: "insensitive" as const } }
    : { active: true };

  let { styles, total } = await fetchPage(matchedWhere, page, pageSize);
  let matched = !!faceShape;

  // A face-shape filter that matches nothing shouldn't leave the grid
  // empty — fall back to the unfiltered catalog instead.
  if (faceShape && total === 0) {
    ({ styles, total } = await fetchPage({ active: true }, page, pageSize));
    matched = false;
  }

  return NextResponse.json({
    styles,
    matched,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  });
}
