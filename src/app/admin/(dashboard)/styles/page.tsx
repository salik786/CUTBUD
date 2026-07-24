import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDisplayImageUrl } from "@/lib/styleImage";

export default async function AdminStylesPage() {
  const styles = await prisma.styleCatalog.findMany({ orderBy: { name: "asc" } });

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

      <div className="mt-6 flex flex-col gap-2">
        {styles.map((style) => (
          <Link
            key={style.id}
            href={`/admin/styles/${style.id}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-page"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-page">
              {getDisplayImageUrl(style) && (
                <Image src={getDisplayImageUrl(style)!} alt="" fill className="object-cover" sizes="56px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{style.name}</p>
              <p className="truncate text-sm text-muted">{style.faceShapeFit}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                style.active ? "bg-emerald-100 text-emerald-700" : "bg-border text-muted"
              }`}
            >
              {style.active ? "Active" : "Inactive"}
            </span>
          </Link>
        ))}
        {styles.length === 0 && <p className="text-sm text-muted">No styles yet.</p>}
      </div>
    </div>
  );
}
