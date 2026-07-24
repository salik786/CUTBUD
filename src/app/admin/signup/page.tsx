import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/adminAuth";
import { SignupForm } from "./SignupForm";

export default async function AdminSignupPage() {
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  const existingCount = await prisma.adminUser.count();
  if (existingCount > 0) {
    return (
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin already set up</h1>
        <p className="mt-2 text-sm text-muted">
          An admin account already exists for this site.{" "}
          <a href="/admin/login" className="font-medium text-accent underline-offset-2 hover:underline">
            Sign in instead
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">Create the admin account</h1>
      <p className="mt-1 text-sm text-muted">
        This is a one-time setup — only the first admin can sign up here.
      </p>
      <SignupForm />
    </main>
  );
}
