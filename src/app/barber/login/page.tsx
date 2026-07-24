import { redirect } from "next/navigation";
import { getBarberUser } from "@/lib/barberAuth";
import { LoginForm } from "./LoginForm";

export default async function BarberLoginPage() {
  const barber = await getBarberUser();
  if (barber) redirect("/barber");

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white">
          C
        </span>
        <span className="text-lg font-bold">CutBuddy for Business</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Shop Login</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to manage your shop profile, pricing, and hairstyle offerings.
      </p>
      <LoginForm />
    </main>
  );
}
