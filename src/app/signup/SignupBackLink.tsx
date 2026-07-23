"use client";

import { useSearchParams } from "next/navigation";
import { BackLink } from "@/components/BackLink";

export function SignupBackLink() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  return <BackLink href={visitId ? `/v/${visitId}/save` : "/"} />;
}
