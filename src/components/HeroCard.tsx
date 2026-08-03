import { Command, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getGreeting } from "@/utils/greeting";

export function HeroCard({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <section className="bg-hero-gradient animate-fade-up relative overflow-hidden rounded-3xl px-6 py-10 text-primary-foreground shadow-[var(--shadow-soft)] sm:px-10 sm:py-12">
      {/* Abstract branding illustration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-primary-foreground/20" />
        <div className="absolute -right-4 top-10 size-52 rounded-full border border-primary-foreground/20" />
        <div className="absolute right-24 -bottom-24 size-64 rounded-3xl border border-primary-foreground/15 rotate-12" />
      </div>

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="size-3.5" />
          One Portal. Every Application.
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {greeting}, Welcome Back
        </h1>
        <p className="mt-2 max-w-lg text-sm text-primary-foreground/80 sm:text-base">
          Access all Maharasa applications from one place — fast, secure and always up to date.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={onOpenSearch}
            className="gap-2 rounded-xl bg-primary-foreground/95 text-primary hover:bg-primary-foreground"
          >
            <Command className="size-4" />
            Quick search
            <kbd className="ml-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold">
              CTRL K
            </kbd>
          </Button>
        </div>
      </div>
    </section>
  );
}
