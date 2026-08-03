import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maharasa Portal" },
      {
        name: "description",
        content:
          "Maharasa Portal version 1.0.0 — the internal application launcher of Maharasa Group.",
      },
      { property: "og:title", content: "About — Maharasa Portal" },
      { property: "og:description", content: "Version, company and technology behind the portal." },
    ],
  }),
  component: AboutPage,
});

const DETAILS = [
  { label: "Portal Version", value: "1.0.0" },
  { label: "Company", value: "Maharasa Group" },
  { label: "Phase", value: "Phase 1 — Application Launcher" },
];

const STACK = [
  "React 19",
  "TypeScript",
  "Vite",
  "TanStack Start",
  "TanStack Router",
  "TanStack Query",
  "TailwindCSS",
  "shadcn/ui",
  "Lucide Icons",
];

function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="About" description="One Portal. Every Application." />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <dl className="space-y-4">
          {DETAILS.map((item) => (
            <div key={item.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Technology Stack
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        Roadmap: an admin panel for managing applications, a REST API data source, and centralised
        single sign-on with role-based application visibility.
      </div>
    </div>
  );
}
