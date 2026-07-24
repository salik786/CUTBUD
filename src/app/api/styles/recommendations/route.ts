import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildStyleWhere, buildStyleOrderBy } from "@/lib/styleFilters";

const PAGE_SIZE_DEFAULT = 6;
const PAGE_SIZE_MAX = 24;

// Style catalog changes rarely (admin-managed) — cache each distinct
// page/filter combination for a short window instead of hitting Postgres
// on every request, without risking noticeably stale data after an edit.
export const revalidate = 30;

async function fetchPage(
  where: Prisma.StyleCatalogWhereInput,
  orderBy: Prisma.StyleCatalogOrderByWithRelationInput[],
  page: number,
  pageSize: number
) {
  const [styles, total] = await Promise.all([
    prisma.styleCatalog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.styleCatalog.count({ where }),
  ]);
  return { styles, total };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const faceShape = searchParams.get("faceShape") ?? undefined;
  const filter = searchParams.get("filter") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const texture = searchParams.get("texture") ?? undefined;
  const length = searchParams.get("length") ?? undefined;
  const maintenance = searchParams.get("maintenance") ?? undefined;
  const premium = searchParams.get("premium") === "1";
  const sort = searchParams.get("sort") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT)
  );

  const orderBy = buildStyleOrderBy(sort);
  const matchedWhere = buildStyleWhere({ faceShape, filter, q, texture, length, maintenance, premium });

  let { styles, total } = await fetchPage(matchedWhere, orderBy, page, pageSize);
  let matched = !!faceShape;

  // A face-shape filter that matches nothing shouldn't leave the grid
  // empty — fall back to the rest of the filters instead.
  if (faceShape && total === 0) {
    ({ styles, total } = await fetchPage(
      buildStyleWhere({ filter, q, texture, length, maintenance, premium }),
      orderBy,
      page,
      pageSize
    ));
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
