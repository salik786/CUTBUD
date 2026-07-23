"use client";

import { useState } from "react";

export function StarRating({
  name,
  defaultValue = 0,
  size = "md",
}: {
  name: string;
  defaultValue?: number;
  size?: "sm" | "md";
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const dim = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label={name}>
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setValue(n)}
          className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            viewBox="0 0 24 24"
            className={`${dim} transition-colors duration-150`}
            fill={n <= shown ? "var(--color-star)" : "none"}
            stroke={n <= shown ? "var(--color-star)" : "var(--color-border)"}
            strokeWidth={1.5}
          >
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
