import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const shopId = req.nextUrl.searchParams.get("shopId");
  if (!shopId) {
    return NextResponse.json({ error: "shopId is required" }, { status: 400 });
  }

  const generations = await prisma.styleGeneration.groupBy({
    by: ["styleCatalogId"],
    where: { visit: { shopId } },
    _count: { styleCatalogId: true },
    orderBy: { _count: { styleCatalogId: "desc" } },
    take: 5,
  });

  const styleIds = generations.map((g) => g.styleCatalogId);
  let styles = await prisma.styleCatalog.findMany({ where: { id: { in: styleIds }, active: true } });

  if (styles.length === 0) {
    // No generations recorded yet at this shop — fall back to the catalog.
    styles = await prisma.styleCatalog.findMany({ where: { active: true }, take: 5 });
  }

  return NextResponse.json({ styles });
}
