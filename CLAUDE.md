# Maharasa Portal — CLAUDE.md

Internal application launcher for Maharasa Group. One page, every company app
(HRIS, IT Helpdesk, CMMS, Inventory, Finance, …). Tagline: *One Portal. Every
Application.*

Phase 1 is what exists today: local seed data, links open in a new tab, no
authentication. Phase 2 (REST API, Admin Panel, SSO) is prepared for in the
types and service layer but **not implemented** — see [Phase boundaries](#phase-boundaries).

## Commands

Lockfile is `bun.lock`, so prefer `bun`. Do not commit a second lockfile.

```sh
bun install
bun run dev        # vite dev server
bun run build      # production build (nitro, cloudflare target)
bun run preview    # serve the build
bun run lint       # eslint
bun run format     # prettier --write .
```

There is no test runner configured. Verify changes with `bun run lint` plus a
build, and by exercising the page in `dev`.

## Stack

React 19 · TypeScript · TanStack Start (SSR) + TanStack Router · TanStack Query ·
Tailwind CSS v4 · shadcn/ui (Radix) · Lucide icons · Vite 8.

`vite.config.ts` extends `@lovable.dev/vite-tanstack-config`. That preset
already wires TanStack Start, React, Tailwind, tsconfig paths, nitro, and the
`@` alias — **do not re-add those plugins manually**, duplicates break the app.

## Layout of the code

| Path | Role |
| --- | --- |
| [src/routes/](src/routes/) | File-based routes. `__root.tsx` is the app shell. See [src/routes/README.md](src/routes/README.md) for naming rules. |
| [src/routeTree.gen.ts](src/routeTree.gen.ts) | Generated. Never edit by hand. |
| [src/layouts/](src/layouts/) | `PortalLayout`, `TopNav`, `AppSidebar`, `portal-context.ts`. |
| [src/components/](src/components/) | Portal-specific presentational components. |
| [src/components/ui/](src/components/ui/) | shadcn/ui primitives. Treat as vendored — regenerate rather than hand-tune. |
| [src/hooks/](src/hooks/) | `usePortalApplications`, `useFavorites`, `useRecentApps`, `useTheme`, `useLocalStorage`. |
| [src/services/applicationService.ts](src/services/applicationService.ts) | The only data-access boundary. |
| [src/data/applications.ts](src/data/applications.ts) | Seed application list. |
| [src/types/application.ts](src/types/application.ts) | Domain types (`Application`, `AppCategory`, `AppStatus`, …). |
| [src/utils/](src/utils/) | `launcher.ts` (single hand-off point to a target app), `greeting.ts`. |
| [src/lib/](src/lib/) | `utils.ts` (`cn`) plus Lovable error-reporting plumbing — leave the error files alone. |

## Rules that matter here

**Application data never lives in components.** Add or edit apps in
[src/data/applications.ts](src/data/applications.ts) only. Components read
through hooks, hooks read through `ApplicationService`. A new app should require
zero UI changes.

**Go through the service layer.** `ApplicationService` returns Promises even
though Phase 1 is synchronous, precisely so Phase 2 can swap the bodies for
`fetch()` without touching a single component. Never import
`@/data/applications` from a component or hook.

**Never hardcode colors.** All color is oklch design tokens in
[src/styles.css](src/styles.css) (`--primary`, `--accent`, `--surface`,
`--success`, `--warning`, sidebar and chart scales). Use Tailwind token classes
(`bg-primary`, `text-muted-foreground`). Brand: `#006400` primary, `#0F9D58`
accent, `#F8FAFC` background, 16px radius, soft shadows, subtle animation.
Every change must look right in both light and dark mode.

**Launch apps via `launchApplication`.** Do not call `window.open` directly —
Phase 2 resolves SSO redirects inside that function.

**localStorage is SSR-hazardous.** Always go through `useLocalStorage`, which
reads after hydration and returns a `hydrated` flag. Keys in use:
`maharasa.theme`, `maharasa.favorites`, `maharasa.recent` (max 10 entries).
Rendering different markup before `hydrated` is true causes hydration mismatch.

**Routing is TanStack, not Next.js.** No `src/pages/`, no `app/layout.tsx`.
Dynamic segments are `$id`, splats are `$.tsx` read via `_splat`.

**Loading and empty states are required.** Skeleton UI while `isLoading`,
`EmptyState` when a filter or search returns nothing. No blank screens.

## Phase boundaries

`Application` already carries `requiresAuth`, `authProvider`, `auth`, `roles`,
`permissions`, and `launchType`. These are placeholders for Phase 2 SSO.

Do **not**, unless explicitly asked:

- implement authentication, OIDC, JWT, or session handling;
- build the Admin Panel (add/edit/delete/reorder applications);
- surface the Phase 2 auth fields in the UI.

Do keep the architecture able to absorb them without a refactor.

## Git and Lovable

This repo is connected to Lovable and syncs both ways on `main`.

- Never force-push, rebase, amend, or squash commits that are already pushed —
  it rewrites history on Lovable's side and the user loses project history.
- Keep the pushed branch in a working state; every push shows up in the editor.
- [AGENTS.md](AGENTS.md) is Lovable-managed. Put durable guidance in this file
  instead, so a Lovable regeneration cannot drop it.

## Skills

- `caveman` ([.claude/skills/caveman/SKILL.md](.claude/skills/caveman/SKILL.md)) —
  terse caveman-voice replies. Style only; code and commit messages stay normal.
  Invoke with `/caveman` or by asking for caveman mode.
