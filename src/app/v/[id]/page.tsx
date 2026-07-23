import { prisma } from "@/lib/prisma";
import { EntryStart } from "./EntryStart";

export default async function EntryLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await prisma.shop.findUnique({ where: { entryQrToken: id } });

  if (!shop || !shop.active) {
    return (
      <main className="hero-gradient flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-white">
        <h1 className="text-2xl font-bold">This code isn&apos;t working</h1>
        <p className="max-w-sm text-sm text-white/60">
          This QR code has expired or the shop isn&apos;t set up yet. Ask at the counter for a
          fresh code.
        </p>
      </main>
    );
  }

  return (
    <main className="hero-gradient relative flex flex-1 flex-col overflow-hidden px-6 py-10 text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-cover bg-top opacity-40"
        style={{
          backgroundImage:
            "url('https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_065754_bf4d92bf-fe3f-4441-81ed-c9f4bfe3fbd4.png')",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
        aria-hidden
      />

      <div className="fade-up relative flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold">
          C
        </span>
        <span className="text-lg font-bold">CutBuddy</span>
      </div>

      <div className="relative mt-14 flex flex-1 flex-col justify-center">
        <h1
          className="fade-up text-[2.5rem] font-bold leading-[1.05] tracking-tight"
          style={{ animationDelay: "60ms" }}
        >
          Find Your <span className="text-[#b6a2ff]">Perfect Haircut</span>
        </h1>
        <p className="fade-up mt-3 text-[15px] leading-relaxed text-white/60" style={{ animationDelay: "120ms" }}>
          Get AI recommended hairstyles that suit you best.
        </p>

        <div
          className="fade-up mt-8 rounded-2xl border border-white/10 bg-white/5 p-5"
          style={{ animationDelay: "180ms" }}
        >
          <p className="text-sm font-semibold">Welcome to {shop.name}</p>
          <p className="mt-1 text-xs text-white/50">Ready when you are — no app, no sign-up.</p>
          <div className="mt-4">
            <EntryStart entryQrToken={shop.entryQrToken} />
          </div>
        </div>

        <div
          className="fade-up mt-8 grid grid-cols-3 gap-3 text-center text-xs text-white/60"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg">✂️</span>
            1000+ Styles
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg">✨</span>
            AI Powered
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg">🔒</span>
            Privacy First
          </div>
        </div>
      </div>
    </main>
  );
}
