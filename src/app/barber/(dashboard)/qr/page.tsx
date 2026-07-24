import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getBarberUser } from "@/lib/barberAuth";

export default async function BarberQrPage() {
  const barber = await getBarberUser();
  if (!barber) redirect("/barber/login");

  const totalScans = await prisma.visit.count({ where: { shopId: barber.shopId } });

  // Prefer an explicit app URL; fall back to Vercel's own runtime host so
  // this doesn't silently print localhost links once deployed.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const entryUrl = `${appUrl}/v/${barber.shop.entryQrToken}`;
  const qrDataUrl = await QRCode.toDataURL(entryUrl, { width: 640, margin: 2 });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">QR Code</h1>
      <p className="mt-1 text-sm text-muted">
        Print this and put it on the counter, mirror, or window — customers scan it to browse
        styles you offer and show you exactly what they want.
      </p>

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row">
        <div className="rounded-2xl border border-border bg-surface p-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image */}
          <img src={qrDataUrl} alt="Your shop's entry QR code" className="h-64 w-64" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Scans</p>
            <p className="mt-1 text-2xl font-bold tabular">{totalScans}</p>
          </div>
          <a
            href={qrDataUrl}
            download={`${barber.shop.name.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`}
            className="rounded-xl bg-accent px-5 py-3 text-center text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Download PNG
          </a>
          <p className="max-w-xs text-xs text-muted">
            Links to: <span className="font-mono">{entryUrl}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
