import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildAdminStyleWhere, buildAdminOrderBy } from "@/lib/adminStyleFilters";
import { StylesTable } from "./StylesTable";

const PAGE_SIZE = 25;

export default async function AdminStylesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    model?: string;
    faceShape?: string;
    status?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const where = buildAdminStyleWhere(sp);
  const orderBy = buildAdminOrderBy(sp.sort, sp.dir);

  const [styles, total, categoryRows, modelRows] = await Promise.all([
    prisma.styleCatalog.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.styleCatalog.count({ where }),
    prisma.styleCatalog.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.styleCatalog.findMany({
      where: { modelId: { not: null } },
      select: { modelId: true },
      distinct: ["modelId"],
      orderBy: { modelId: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Styles</h1>
        <Link
          href="/admin/styles/new"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Style
        </Link>
      </div>

      <StylesTable
        styles={styles}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        categories={categoryRows.map((c) => c.category!).filter(Boolean)}
        models={modelRows.map((m) => m.modelId!).filter(Boolean)}
      />
    </div>
  );
}
