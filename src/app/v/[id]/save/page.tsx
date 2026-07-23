import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BackLink } from "@/components/BackLink";

export default async function SavePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) notFound();

  return (
    <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 py-10">
      <BackLink href={`/v/${id}/rate`} />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="fade-up flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-white">
        💾
      </div>
      <h1 className="fade-up mt-5 text-[1.75rem] font-bold tracking-tight" style={{ animationDelay: "60ms" }}>
        Love your new haircut?
      </h1>
      <p className="fade-up mt-2 text-[15px] leading-relaxed text-muted" style={{ animationDelay: "100ms" }}>
        Save your hairstyle, photos and barber in your personal library.
      </p>

      <div className="fade-up mt-7 w-full" style={{ animationDelay: "140ms" }}>
        <PrimaryButton href={`/signup?visitId=${visit.id}`}>Save My Hairstyle</PrimaryButton>
      </div>
      <Link
        href="/me/home"
        className="fade-up mt-4 text-sm font-medium text-muted underline-offset-2 hover:underline"
        style={{ animationDelay: "180ms" }}
      >
        Maybe Later
      </Link>

      <p className="fade-up mt-8 text-xs text-muted" style={{ animationDelay: "220ms" }}>
        We&apos;ll never share anything without your permission.
      </p>
      </div>
    </main>
  );
}
