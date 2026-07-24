import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/adminAuth";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
      <p className="mt-1 text-sm text-muted">Sign in to manage CutBuddy content.</p>
      <LoginForm />
    </main>
  );
}
