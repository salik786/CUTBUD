"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/barber/auth/logout", { method: "POST" });
    router.push("/barber/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="font-medium text-accent hover:underline">
      Log out
    </button>
  );
}
