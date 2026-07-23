import Link from "next/link";

const ICONS = {
  home: (
    <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" />
  ),
  explore: <circle cx="12" cy="12" r="8" />,
  qr: (
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 3h3m3 0h.01M14 14h3v3" />
  ),
  history: <path d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4Zm0 0 3 3M12 8v4l3 2" />,
  profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
};

const ITEMS: { key: keyof typeof ICONS; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/me/home" },
  { key: "explore", label: "Explore", href: "/me/explore" },
  { key: "qr", label: "Scan QR", href: "/me/scan" },
  { key: "history", label: "History", href: "/me/history" },
  { key: "profile", label: "Profile", href: "/me/profile" },
];

export function BottomNav({ active }: { active: keyof typeof ICONS }) {
  return (
    <nav className="sticky bottom-0 z-10 flex justify-around border-t border-border bg-surface/95 px-2 py-2 backdrop-blur">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${isActive ? "stroke-accent" : "stroke-muted"}`}
              fill="none"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {ICONS[item.key]}
            </svg>
            <span className={`text-[10px] ${isActive ? "font-semibold text-accent" : "text-muted"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
