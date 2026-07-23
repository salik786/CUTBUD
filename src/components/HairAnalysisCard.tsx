import type { HairAnalysisResult } from "@/services/hairAnalysis";

export function HairAnalysisCard({ result }: { result: HairAnalysisResult }) {
  const rows: [string, string][] = [
    ["Hair Type", result.hairType],
    ["Hair Density", result.hairDensity],
    ["Hair Thickness", result.hairThickness],
    ["Hairline", result.hairline],
    ["Hair Direction", result.hairDirection],
    ["Hair Volume", result.hairVolume],
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hair Analysis</p>
      <dl className="mt-3 divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
