import { redirect } from "next/navigation";
import Link from "next/link";
import { getBarberUser } from "@/lib/barberAuth";
import { LogoutButton } from "./LogoutButton";

export default async function BarberDashboardLayout({ children }: { children: React.ReactNode }) {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/barber" className="text-lg font-bold tracking-tight">
            {barber.shop.name}
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-muted">
            <Link href="/barber" className="hover:text-ink">
              Overview
            </Link>
            <Link href="/barber/profile" className="hover:text-ink">
              Shop Profile
            </Link>
            <Link href="/barber/styles" className="hover:text-ink">
              Hairstyles
            </Link>
            <Link href="/barber/reviews" className="hover:text-ink">
              Reviews
            </Link>
            <Link href="/barber/qr" className="hover:text-ink">
              QR Code
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{barber.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
