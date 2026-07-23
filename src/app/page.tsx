import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrimaryButton } from "@/components/PrimaryButton";

const HERO_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3D5SnkyPj18zFLOhlLQ1pMr2UqK/hf_20260722_072222_3a015c20-68e3-4244-b04e-f23eebd56aa3.png";

export default async function MarketingPage() {
  const shop = await prisma.shop.findFirst({ where: { active: true } });
  const demoStyles = await prisma.styleCatalog.findMany({ where: { active: true }, take: 5 });
  const demoHref = shop ? `/v/${shop.entryQrToken}` : "/dev";

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* 1. Hero */}
      <section className="hero-gradient relative flex min-h-[92vh] flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(19,13,34,0.95) 0%, rgba(19,13,34,0.55) 45%, rgba(19,13,34,0.25) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 py-10">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold">
              C
            </span>
            <span className="text-lg font-bold">CutBuddy</span>
          </div>

          <div className="mt-16 max-w-xl">
            <p className="fade-up text-xs font-semibold uppercase tracking-[0.2em] text-[#b6a2ff]">
              Scan. Choose. Show your barber.
            </p>
            <h1
              className="fade-up mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-white"
              style={{ animationDelay: "60ms" }}
            >
              Every great haircut starts with a clear brief.
            </h1>
            <p
              className="fade-up mt-5 max-w-md text-lg leading-relaxed text-white/70"
              style={{ animationDelay: "120ms" }}
            >
              CutBuddy turns your barbershop&apos;s waiting time into an AI-recommended, all-angle
              haircut brief — so any barber knows exactly what to do.
            </p>
            <div className="fade-up mt-8 flex max-w-xs gap-3" style={{ animationDelay: "180ms" }}>
              <PrimaryButton href={demoHref}>Try the Demo</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <Section
        eyebrow="The Problem"
        title="Finding the right haircut is hard to explain."
        body="A screenshot from Instagram shows one angle and no real instructions. Miscommunication — not lack of skill — is the most common cause of a bad haircut."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">Before</p>
            <p className="mt-2 text-sm text-muted">
              Ten minutes scrolling Reels, three vague screenshots, and a nervous &quot;just make
              it look good.&quot;
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 opacity-70">
              {demoStyles.slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className="aspect-square overflow-hidden rounded-lg"
                  style={{ transform: `rotate(${(i - 1) * 6}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl ?? undefined} alt="" className="h-full w-full object-cover grayscale" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent-light p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">After</p>
            <p className="mt-2 text-sm text-ink/70">
              One QR scan, a face-matched shortlist, and a spec sheet with guard numbers and mm
              lengths.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {demoStyles.slice(0, 3).map((s) => (
                <div key={s.id} className="aspect-square overflow-hidden rounded-lg shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl ?? undefined} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 3. AI Recommendation */}
      <Section
        dark
        eyebrow="AI Powered"
        title="One selfie. A shortlist built for your face."
        body="Upload a photo or answer a few quick questions — CutBuddy matches styles to your face shape instantly, no generic top-10 list."
      >
        <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center">
          <div className="absolute h-40 w-40 rounded-2xl border border-white/10 bg-white/5" />
          {demoStyles.map((s, i) => {
            const angle = (i / demoStyles.length) * 2 * Math.PI;
            const radius = 130;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.55;
            return (
              <div
                key={s.id}
                className="absolute h-16 w-16 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl ?? undefined} alt="" className="h-full w-full object-cover" />
              </div>
            );
          })}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-[0_0_40px_rgba(108,79,240,0.6)]">
            ✨
          </div>
        </div>
      </Section>

      {/* 4. Multi-angle cut card */}
      <Section
        eyebrow="The Signature Cut Card"
        title="Front, side, back — plus the exact spec."
        body="Every recommendation becomes a shareable brief with all-angle references and plain-language instructions: guard numbers, mm lengths, fade type."
      >
        <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <div className="grid grid-cols-3 gap-1 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={demoStyles[0]?.imageUrl ?? undefined}
              alt=""
              className="col-span-1 aspect-square rounded-lg object-cover"
            />
            <div className="skeleton-shimmer flex aspect-square items-center justify-center rounded-lg">
              <span className="text-[9px] uppercase text-muted">Side</span>
            </div>
            <div className="skeleton-shimmer flex aspect-square items-center justify-center rounded-lg">
              <span className="text-[9px] uppercase text-muted">Back</span>
            </div>
          </div>
          <div className="p-4">
            <p className="font-semibold">{demoStyles[0]?.name ?? "Textured crop"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-page px-2.5 py-1 text-muted">
                guard {demoStyles[0]?.guardNumber}
              </span>
              <span className="rounded-full bg-page px-2.5 py-1 text-muted">
                {demoStyles[0]?.lengthMm} mm
              </span>
              <span className="rounded-full bg-page px-2.5 py-1 text-muted">
                {demoStyles[0]?.fadeType}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. Show the barber */}
      <Section
        dark
        eyebrow="At the Chair"
        title="Hand your phone over. That's it."
        body="No app, no explaining. The barber sees exactly what you want — front, side, back, and the spec — and gets to work."
      >
        <div className="mx-auto flex max-w-md items-center justify-center gap-6">
          <div className="text-5xl">🙋</div>
          <div className="h-px flex-1 bg-white/20" />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-2xl">📱</div>
          <div className="h-px flex-1 bg-white/20" />
          <div className="text-5xl">💈</div>
        </div>
      </Section>

      {/* 6. Before & After */}
      <Section
        eyebrow="Proof It Worked"
        title="Rate it the moment you see it."
        body="Right after the cut, capture a before/after and a quick rating — while the result is still visible, not days later."
      >
        <div className="mx-auto flex max-w-sm items-center gap-4">
          <div className="skeleton-shimmer flex aspect-square flex-1 items-center justify-center rounded-2xl">
            <span className="text-xs uppercase text-muted">Before</span>
          </div>
          <div className="text-2xl text-accent">→</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={demoStyles[1]?.imageUrl ?? undefined}
            alt=""
            className="aspect-square flex-1 rounded-2xl object-cover"
          />
        </div>
      </Section>

      {/* 7. Digital Hair Passport */}
      <Section
        dark
        eyebrow="Your Library"
        title="A digital record of every cut that worked."
        body="Save the styles, barbers, and ratings that actually worked for you — reusable at any shop, any time."
      >
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {demoStyles.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl ?? undefined} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs text-white/40">★★★★★</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 8 + 9 combined: QR + Save */}
      <Section
        eyebrow="How It Works"
        title="Scan, choose, save — under five minutes."
        body="A QR code already sitting in the shop is the only thing you need. No install, no account, until you decide a cut is worth saving."
      >
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: "▦", label: "Scan the shop's QR code" },
            { icon: "✨", label: "Get AI-matched recommendations" },
            { icon: "💾", label: "Save the cuts that worked" },
          ].map((step) => (
            <div key={step.label} className="rounded-2xl border border-border bg-surface p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-xl">
                {step.icon}
              </div>
              <p className="mt-3 text-sm font-medium">{step.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 11. Final CTA */}
      <section className="hero-gradient flex flex-col items-center justify-center px-6 py-24 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight">Ready to walk in and get it right?</h2>
        <p className="mt-3 max-w-md text-white/70">
          Scan a shop&apos;s QR code, or try the full flow right now with our demo shop.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <PrimaryButton href={demoHref}>Try the Demo</PrimaryButton>
        </div>
        <Link href="/dev" className="mt-5 text-xs text-white/40 hover:underline">
          Dev tools →
        </Link>
      </section>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`px-6 py-20 ${dark ? "bg-hero-bg text-white" : "bg-page"}`}>
      <div className="mx-auto max-w-3xl text-center">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            dark ? "text-[#b6a2ff]" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{title}</h2>
        <p className={`mt-3 text-[15px] leading-relaxed ${dark ? "text-white/60" : "text-muted"}`}>
          {body}
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-4xl">{children}</div>
    </section>
  );
}
