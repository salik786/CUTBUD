import type { HairAnalysisResult } from "@/services/hairAnalysis";

export function FaceMetricsCard({ result }: { result: HairAnalysisResult }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Face Analysis</p>
        <span className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent">
          {result.confidence}% confidence
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">
        Your face shape is {result.faceShape}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Metric label="Face Length" value={result.faceLength} />
        <Metric label="Jawline" value={result.jawline} />
        <Metric label="Forehead" value={result.forehead} />
      </dl>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-page px-2 py-3">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
