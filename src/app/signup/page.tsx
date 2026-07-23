import { Suspense } from "react";
import { SignupForm } from "./SignupForm";
import { SignupBackLink } from "./SignupBackLink";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-10">
      <Suspense fallback={null}>
        <SignupBackLink />
      </Suspense>

      <h1 className="fade-up mt-4 text-[1.75rem] font-bold tracking-tight">Create Your Free Account</h1>
      <p className="fade-up mt-2 text-[15px] text-muted" style={{ animationDelay: "60ms" }}>
        Save your hairstyles, history and favorite barbers.
      </p>

      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
