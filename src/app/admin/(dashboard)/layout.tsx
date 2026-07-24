import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/adminAuth";
import { LogoutButton } from "./LogoutButton";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            CutBuddy Admin
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-muted">
            <Link href="/admin/styles" className="hover:text-ink">
              Styles
            </Link>
            <Link href="/admin/shops" className="hover:text-ink">
              Shops
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{admin.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
