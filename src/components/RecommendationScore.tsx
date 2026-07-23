import type { HairAnalysisResult } from "@/services/hairAnalysis";

export function RecommendationScore({ result }: { result: HairAnalysisResult }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Style Recommendation Factors
      </p>

      <div className="mt-3">
        <p className="text-xs font-semibold text-emerald-600">Suitable</p>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {result.recommendedStyles.map((style) => (
            <li key={style} className="flex items-center gap-2 text-sm">
              <span className="text-emerald-500">✓</span>
              {style}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-danger">Avoid</p>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {result.avoidStyles.map((style) => (
            <li key={style} className="flex items-center gap-2 text-sm text-muted">
              <span className="text-danger">✕</span>
              {style}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
