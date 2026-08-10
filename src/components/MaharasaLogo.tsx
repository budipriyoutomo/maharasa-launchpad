import { cn } from "@/lib/utils";

/**
 * The Maharasa mark.
 *
 * Renders the brand asset from `public/favicon.svg` so the favicon and the
 * in-app logo can never drift apart — replace that one file and both update.
 * The asset is full-bleed, so the rounded corner is applied here; the radius is
 * a percentage to keep its proportion at every size the callers ask for.
 */
export function MaharasaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt="Maharasa"
      width={512}
      height={512}
      className={cn("size-9 shrink-0 rounded-[28%]", className)}
    />
  );
}
