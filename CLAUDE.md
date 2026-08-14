# Maharasa Portal — CLAUDE.md

Internal application launcher for Maharasa Group. One page, every company app
(HRIS, IT Helpdesk, CMMS, Inventory, Finance, …). Tagline: _One Portal. Every
Application._

Links open in a new tab and there is no authentication. Of the three Phase 2
blocks, only the **API** one is done: the catalogue is served by the portal's
own server through TanStack Start server functions, backed by a seed file
rather than a database. Admin Panel and SSO are prepared for in the types but
**not implemented** — see [Phase boundaries](#phase-boundaries).

## Commands

Lockfile is `bun.lock`, so prefer `bun`. Do not commit a second lockfile.

```sh
bun install
bun run dev        # vite dev server
bun run build      # production build (nitro, cloudflare target)
bun run preview    # serve the build
bun run lint       # eslint
bun run format     # prettier --write .
bun run test       # vitest run
bun run test:watch # vitest
```

Verify changes with `bun run test`, `bun run lint` and a build, and by
exercising the page in `dev`.

## How work is done here: test first

**This project is test-driven. The test comes before the implementation — no
exceptions for "small" changes.** A behaviour that is not covered by a failing
test before it is written is a behaviour nobody has specified.

The loop, for every change:

1. **Red.** Write the test for the behaviour you are about to add or fix. Run
   `bun run test:watch` and _watch it fail_. A test that passes before the
   implementation exists is testing nothing — fix the test, not the code.
2. **Green.** Write the least code that makes it pass. Do not build ahead of
   the test.
3. **Refactor.** Clean up with the suite green, and keep it green.

Bug fixes start with a test that reproduces the bug and fails for the reason
the user reported. Fix after, never before — otherwise there is no proof the
fix addressed the actual cause, and nothing stops the bug coming back.

Do not finish a task by adding tests to whatever was already built. That is
test-after with extra steps: it produces tests shaped like the implementation,
which pass on wrong behaviour as happily as on right behaviour.

### Setup

Vitest + Testing Library, configured in [vitest.config.ts](vitest.config.ts)
(deliberately separate from `vite.config.ts` — unit tests need the `@` alias,
not the Start preset). Specs live next to their subject as `*.test.ts(x)`.
Shared fixtures live in [src/test/factories.ts](src/test/factories.ts).

### What a test asserts

Test the behaviour a user or a caller depends on, not the shape of the code.
Accessible queries (`getByRole`, `getByLabelText`) over test ids and class
names; a class name is only worth asserting when the class _is_ the contract,
as with the `-strong` contrast tokens in
[StatusBadge.test.tsx](src/components/StatusBadge.test.tsx).

Every spec that is not about the seed data itself builds its own fixtures with
`makeApplication` / `makeNotification`. The catalogue is content — entries get
renamed and commented out routinely, and a test that names `"helpdesk"` fails
on a content edit while the code is fine. The one deliberate exception is
[applicationCatalog.test.ts](src/services/applicationCatalog.test.ts), which
tests the seed data and derives every assertion from whatever is in it.

### What that means per layer

| Layer                                              | How it is driven                                                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Pure logic (`utils/`, `lib/`, catalogue selectors) | Plain unit test. No mocks, no DOM.                                                                                         |
| Components                                         | Render it, drive it with `fireEvent`, assert what the user sees. Wrap in `TooltipProvider` if the component has a tooltip. |
| Hooks over preferences                             | `renderHook` inside `QueryClientProvider` + `PreferencesProvider`, with `window.localStorage` seeded in `beforeEach`.      |
| Server functions                                   | Not directly testable — see below.                                                                                         |

Vitest does not run the TanStack Start plugin, so **a module calling
`createServerFn` cannot be imported by a spec**. This is a constraint on
design, not only on tests: keep the logic worth testing in a plain module the
server function calls (`applicationCatalog.ts`), and `vi.mock` the service in
anything that imports it, as
[preferences.test.tsx](src/hooks/preferences.test.tsx) does. If a piece of
logic is hard to test, that is a fact about the code — move it, do not skip it.

### Not worth a test

`src/components/ui/` (vendored shadcn — regenerate, do not test),
`routeTree.gen.ts` (generated), route files (thin wiring; test the component
they render), and pure styling.

## Stack

React 19 · TypeScript · TanStack Start (SSR) + TanStack Router · TanStack Query ·
Tailwind CSS v4 · shadcn/ui (Radix) · Lucide icons · Vite 8.

`vite.config.ts` extends `@lovable.dev/vite-tanstack-config`. That preset
already wires TanStack Start, React, Tailwind, tsconfig paths, nitro, and the
`@` alias — **do not re-add those plugins manually**, duplicates break the app.

## Layout of the code

| Path                                                                     | Role                                                                                                                                                                               |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [src/routes/](src/routes/)                                               | File-based routes. `__root.tsx` is the app shell. See [src/routes/README.md](src/routes/README.md) for naming rules.                                                               |
| [src/routeTree.gen.ts](src/routeTree.gen.ts)                             | Generated. Never edit by hand.                                                                                                                                                     |
| [src/layouts/](src/layouts/)                                             | `PortalLayout`, `TopNav`, `AppSidebar`, `portal-context.ts`.                                                                                                                       |
| [src/components/](src/components/)                                       | Portal-specific presentational components.                                                                                                                                         |
| [src/components/ui/](src/components/ui/)                                 | shadcn/ui primitives. Treat as vendored — regenerate rather than hand-tune.                                                                                                        |
| [src/hooks/](src/hooks/)                                                 | `PreferencesProvider` (owns all client preferences), `usePortalApplications`, `useCategories`, `useNotifications`, `useFavorites`, `useRecentApps`, `useTheme`, `useLocalStorage`. |
| [src/services/applicationService.ts](src/services/applicationService.ts) | The only data-access boundary. Server functions (RPC) — runs on the server, called from anywhere.                                                                                  |
| [src/services/applicationCatalog.ts](src/services/applicationCatalog.ts) | Server-only catalogue reads. The single place that touches the seed data.                                                                                                          |
| [src/data/applications.ts](src/data/applications.ts)                     | Seed application list. Server-only — never reaches the browser.                                                                                                                    |
| [src/types/application.ts](src/types/application.ts)                     | Domain types (`Application`, `AppCategory`, `AppStatus`, …).                                                                                                                       |
| [src/utils/](src/utils/)                                                 | `launcher.ts` (single hand-off point to a target app), `greeting.ts`.                                                                                                              |
| [src/lib/](src/lib/)                                                     | `utils.ts` (`cn`) plus Lovable error-reporting plumbing — leave the error files alone.                                                                                             |
| [src/test/](src/test/)                                                   | Test fixtures (`factories.ts`). Never imported by application code.                                                                                                                |

## Rules that matter here

**Test first.** Red, green, refactor — see
[How work is done here](#how-work-is-done-here-test-first). A change that
arrives without a test that failed before it is not finished.

**Application data never lives in components.** Add or edit apps in
[src/data/applications.ts](src/data/applications.ts) only. Components read
through hooks, hooks read through `ApplicationService`. A new app should require
zero UI changes.

**Go through the service layer.** `ApplicationService` is a set of TanStack
Start server functions: they execute on the server during SSR and over HTTP
from the browser. Components read through hooks, hooks read through the
service, and the service is the only caller of `applicationCatalog.ts`.

**The seed data must never reach the browser.** `applicationCatalog.ts` is
loaded with a dynamic `import()` _inside_ each server-function handler in
[applicationService.ts](src/services/applicationService.ts). That is what keeps
[src/data/applications.ts](src/data/applications.ts) — and every internal
Maharasa URL in it — out of the client bundle. Hoisting that import to the top
of the file would ship the whole catalogue to every visitor. Never import
`@/data/applications` from anywhere except `applicationCatalog.ts`.

After changing anything in the service layer, confirm the data is still absent
from the client build:

```sh
bun run build
grep -rl "maharasa.id" .output/public/assets/   # only the placeholder email in TopNav may match
```

**Validate server-function input.** Anything reaching a handler came off the
network. Server functions that take arguments use `.validator()` with a zod
schema; keep it that way.

**Keep the pure logic out of `createServerFn`.** Unit tests run without the
TanStack Start plugin, so a module that calls `createServerFn` cannot be
imported in a spec. Selector logic lives in `applicationCatalog.ts` and is
tested there; anything that imports `applicationService` in a test must
`vi.mock` it, as [preferences.test.tsx](src/hooks/preferences.test.tsx) does.

**Never hardcode colors.** All color is oklch design tokens in
[src/styles.css](src/styles.css) (`--primary`, `--accent`, `--surface`,
`--success`, `--warning`, sidebar and chart scales). Use Tailwind token classes
(`bg-primary`, `text-muted-foreground`). Brand: `#006400` primary, `#0F9D58`
accent, `#F8FAFC` background, 16px radius, soft shadows, subtle animation.
Every change must look right in both light and dark mode.

`--success`, `--destructive` and `--warning` are _fill_ colors — at small sizes
on a tinted chip they fall under 4.5:1 in light mode. For text and for
meaningful icons use `--success-strong`, `--destructive-strong`,
`--warning-strong`, which are darkened in light mode and identical to the base
token in dark mode.

**Launch apps via `launchApplication`.** Do not call `window.open` directly —
Phase 2 resolves SSO redirects inside that function.

**localStorage is SSR-hazardous, and it is global.** Every client preference is
owned by a single [PreferencesProvider](src/hooks/PreferencesProvider.tsx)
mounted in `PortalLayout`; `useTheme`, `useFavorites` and `useRecentApps` are
thin readers of that context. Never call `useLocalStorage` from a component —
two copies of the same key drift apart and the UI desyncs. `useLocalStorage`
reads after hydration, follows the `storage` event across tabs, and returns
`hydrated` plus `hasStoredValue`. Keys in use: `maharasa.theme`,
`maharasa.favorites`, `maharasa.recent` (max 10 entries),
`maharasa.notifications.read`. Rendering different markup before `hydrated` is
true causes hydration mismatch.

**Routing is TanStack, not Next.js.** No `src/pages/`, no `app/layout.tsx`.
Dynamic segments are `$id`, splats are `$.tsx` read via `_splat`.

**Loading and empty states are required.** Skeleton UI while `isLoading`,
`EmptyState` when a filter or search returns nothing. No blank screens.

## Phase boundaries

There are two phases only. Phase 1 (the launcher) is done. Phase 2 has three
blocks, and one of them has landed:

- **API — done.** The catalogue is served by server functions. It is not a
  public REST surface; it is RPC for this frontend. If another application ever
  needs the catalogue over HTTP, that is a new decision (endpoints, auth, CORS),
  not an extension of what exists.
- **Persistent store — not started.** The catalogue is still a seed file, edited
  by commit. Swapping it for a database or an upstream API is a change to
  `applicationCatalog.ts` and nothing else.
- **Admin Panel and SSO — not started.**

`Application` already carries `requiresAuth`, `authProvider`, `auth`, `roles`,
`permissions`, and `launchType`. These are placeholders for SSO.

Do **not**, unless explicitly asked:

- implement authentication, OIDC, JWT, or session handling;
- build the Admin Panel (add/edit/delete/reorder applications);
- surface the auth fields in the UI.

The Admin Panel needs both a writable store and authentication. Shipping CRUD
before SSO would let any visitor rewrite the company's application catalogue.

Do keep the architecture able to absorb the rest without a refactor.

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
