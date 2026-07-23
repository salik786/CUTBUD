const STEPS = ["Photo", "Recommended", "Details", "Review"];

export function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "upcoming";
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                  state === "upcoming"
                    ? "bg-border text-muted"
                    : "bg-accent text-white"
                }`}
              >
                {n}
              </div>
              <span
                className={`text-[11px] ${state === "active" ? "font-semibold text-ink" : "text-muted"}`}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <div
                className={`mx-2 mb-4 h-px flex-1 transition-colors duration-300 ${
                  n < step ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
