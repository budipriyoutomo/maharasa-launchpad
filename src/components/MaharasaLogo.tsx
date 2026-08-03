import { cn } from "@/lib/utils";

/**
 * The Maharasa mark.
 *
 * Kept as an inline SVG rather than an asset file so it can be sized with
 * Tailwind and pick up design tokens in both light and dark mode. Replace the
 * geometry here — and in `public/favicon.svg` — when the official brand asset
 * lands; nothing else needs to change.
 */
export function MaharasaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Maharasa"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 22.5V11L16 17.5L23 11V22.5"
        fill="none"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
    </svg>
  );
}
