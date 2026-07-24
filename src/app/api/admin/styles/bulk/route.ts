import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";

type BulkAction = "activate" | "deactivate" | "delete";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { ids, action } = (await req.json()) as { ids?: string[]; action?: BulkAction };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  if (action === "activate" || action === "deactivate") {
    const { count } = await prisma.styleCatalog.updateMany({
      where: { id: { in: ids } },
      data: { active: action === "activate" },
    });
    return NextResponse.json({ ok: true, count });
  }

  if (action === "delete") {
    // Per-row, not a single deleteMany — a style that already has generated
    // cut cards hits a foreign-key constraint and must be skipped rather
    // than failing the whole batch.
    const failed: string[] = [];
    for (const id of ids) {
      try {
        await prisma.styleCatalog.delete({ where: { id } });
      } catch {
        failed.push(id);
      }
    }
    return NextResponse.json({ ok: true, deleted: ids.length - failed.length, failed });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
