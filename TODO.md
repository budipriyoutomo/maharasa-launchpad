# Maharasa Portal — Outstanding Work

Gap analysis against [promp-loveable.md](promp-loveable.md), and what is left
after the fix pass.

---

## Done

**Defects**

- Client preference state is shared. Theme, favorites, recent history and
  notification read-state are owned by one
  [PreferencesProvider](src/hooks/PreferencesProvider.tsx) mounted in
  `PortalLayout`; `useTheme`, `useFavorites` and `useRecentApps` read that
  context. Pinning in the grid now updates the command palette, the stat cards
  and the settings page immediately.
- Preferences follow the `storage` event, so two open tabs stay in sync.
- Seeded favorites no longer vanish on the first user pin. `PreferencesProvider`
  copies the `favorite: true` defaults into localStorage once per device, and
  `hasStoredValue` stops it re-seeding a user who deliberately cleared them.
- `useLocalStorage` no longer writes to storage inside a `setState` updater.

**Missing against the prompt**

- Brand mark: [MaharasaLogo](src/components/MaharasaLogo.tsx) plus
  `public/favicon.svg`, shown in the sidebar and in `TopNav` at every
  breakpoint (the sidebar collapses to icons and is a sheet on mobile).
- Notification layer built like the application layer:
  [types](src/types/notification.ts) →
  [data](src/data/notifications.ts) →
  [service](src/services/notificationService.ts) →
  [useNotifications](src/hooks/useNotifications.ts) →
  [NotificationMenu](src/components/NotificationMenu.tsx), with unread badge,
  per-kind styling, skeleton, empty state and mark-as-read.
- Command palette leads with Recently Used and Favorites, then groups the rest
  by category.
- Dashboard no longer duplicates the Applications page — it shows favorites,
  recents and a link into the full directory.

**Quality**

- `lint` is a working gate again: prettier `endOfLine: "auto"` fixed 6 742
  CRLF-only errors caused by `core.autocrlf`, and the remaining real formatting
  errors were fixed.
- Category lists go through the service layer
  (`ApplicationService.getCategories` + [useCategories](src/hooks/useCategories.ts)),
  so no component imports `@/data` any more.
- Duplicate application ids now throw in dev and log in production, checked in
  the service so a Phase 2 API payload gets the same guard.
- Search and filter on `/applications` live in the URL (`?q=`, `?filter=`) and
  survive refresh; defaults stay out of the query string.
- Offline applications explain themselves: `aria-disabled` (still focusable)
  plus a tooltip.
- Accessibility: `--success-strong`, `--destructive-strong` and
  `--warning-strong` tokens fix light-mode contrast (status chips were 3.3:1 and
  4.1:1, the pinned star 1.96:1 — all now clear their thresholds), `aria-pressed`
  on the pin button, and a skip-to-content link ahead of the sidebar.
- Vitest + Testing Library configured in [vitest.config.ts](vitest.config.ts).
  100 tests across 17 files cover the catalogue selectors, the notification
  service, `useLocalStorage`, favorites/recents, theme, notifications, the
  portal view model, the launcher, `cn`, and the presentational components
  (card, grid, browser, chips, badge, icon, empty state).
- The project is now test-driven: the test comes before the implementation, and
  bug fixes start with a failing reproduction. Written up in
  [CLAUDE.md](CLAUDE.md#how-work-is-done-here-test-first); shared fixtures live
  in [src/test/factories.ts](src/test/factories.ts).

Verified: `tsc --noEmit` clean, `lint` 0 errors (6 pre-existing react-refresh
warnings in vendored `components/ui`), 29/29 tests pass, production build
succeeds, and both `/` and `/applications?q=…&filter=…` render without error.

(Corrected later, while verifying the Vercel deployment: what renders
server-side is the page _shell_. No route defines a loader, so the catalogue
itself is fetched after hydration.)

---

## Still open

### Needs assets from the business — P1

The mark in `MaharasaLogo` and `public/favicon.svg` is a placeholder monogram,
not the official Maharasa logo.

- [ ] Drop in the real logo (SVG). Two places: the inline component and the
      favicon — the component keeps the geometry theme-aware.
- [ ] Replace the Open Graph image. `og:image` and `twitter:image` in
      [src/routes/\_\_root.tsx](src/routes/__root.tsx) still point at a
      Lovable-hosted `gpt-engineer-file-uploads` URL. Needs a real 1200×630
      raster (PNG/JPG — SVG is not rendered by most link unfurlers).

### Housekeeping — P2

- [x] Package manager settled: **npm**. `bun.lock` and `bunfig.toml` are
      deleted, `package-lock.json` is committed, and the other lockfiles are
      gitignored so a second one cannot be committed by accident. See the
      note under [Dropping bun](#dropping-bun) for what was lost with it.
- [ ] Replace `public/favicon.ico`. It is still the stock Lovable icon and is
      the fallback for browsers that do not take `favicon.svg`.
- [ ] `vite preview` is broken for this target: it looks for
      `dist/server/server.js` while the nitro build writes to `.output`. Use
      `npx nitro preview` or the dev server until the preset is fixed.
- [ ] `vite-tsconfig-paths` can be dropped — Vite 8 resolves tsconfig paths
      natively via `resolve.tsconfigPaths`. It lives in the Lovable preset, so
      the warning is theirs to clear.

### Deferred by design

Per the prompt and [CLAUDE.md](CLAUDE.md), still out of scope. The architecture
absorbs them without a refactor.

- Authentication / SSO — OIDC, JWT, token refresh, session management
- Role- and permission-based application visibility
- Admin Panel — add / edit / delete / reorder applications, icon upload.
  Blocked on both a writable store and SSO; CRUD without login would let any
  visitor rewrite the catalogue.
- Persistent store. The catalogue is still a seed file edited by commit.
  Planned next — see
  [Phase 2 — persistent store](#phase-2--persistent-store-next).

---

## Phase 2 — API layer (done)

The catalogue moved off the client and onto the portal's own server.

- [applicationService.ts](src/services/applicationService.ts) is now four
  TanStack Start server functions (`getAll`, `getById`, `query`,
  `getCategories`) instead of a local class. They run on the Worker during SSR
  and over HTTP from the browser. The `IApplicationService` signatures did not
  change, so no component or hook was touched.
- [applicationCatalog.ts](src/services/applicationCatalog.ts) holds the pure
  selectors and is the only module importing the seed data. It is pulled in
  with a dynamic `import()` inside each handler, which keeps
  [applications.ts](src/data/applications.ts) out of the client bundle —
  verified against `.output/public/assets/`, where no application URL or
  description now appears.
- Arguments are validated at the boundary with zod (`applicationQuerySchema`).
- The artificial 350 ms latency is now dev-only; production pays real network
  time.
- Tests follow the split: `applicationService.test.ts` was replaced by
  [applicationCatalog.test.ts](src/services/applicationCatalog.test.ts), which
  tests the selectors directly — Vitest does not run the Start plugin, so a
  module calling `createServerFn` cannot be imported in a spec.
  [preferences.test.tsx](src/hooks/preferences.test.tsx) stubs the service.
- Assertions are derived from the catalogue instead of naming specific
  applications. The three failing tests before this pass were all caused by
  entries being commented out of the seed file, not by broken code.

Verified: `tsc --noEmit` clean, `lint` 0 errors, 31/31 tests pass, production
build succeeds, and `/` plus `/applications` render the live catalogue in a real
browser against the running dev server.

### Note on the seed file

19 of the 22 applications in [applications.ts](src/data/applications.ts) are
commented out; only `hris`, `tukar-faktur` and `cmms` are live. `CATEGORIES`
still lists all nine categories, so six of them render a filter chip that always
resolves to an empty state. Left as-is — deciding whether to restore the
applications or trim the category list is a content call, not a code one.

---

## Phase 2 — persistent store (next)

Replace the seed file with a store that can be written to, so the Admin Panel
has something to write to when SSO lands. Everything here is confined to
[applicationCatalog.ts](src/services/applicationCatalog.ts) and its new
adapters — no component, hook or server function signature changes.

**Deployment context.** The portal is deployed on **Vercel**, not Cloudflare.
That reverses the earlier assumption in this file: Cloudflare D1 is off the
table (its binding is Workers-only and the generated
[.output/server/wrangler.json](.output/server/wrangler.json) is not a repo file
we control), while a normal Node runtime with TCP access is available, so a
plain Postgres client works.

**Honest framing.** With no Admin Panel, this ships no visible feature. It
moves catalogue edits from a git commit to a database row — and loses the git
history of catalogue changes in the process. The payoff arrives with the Admin
Panel, which is blocked on SSO. This is foundation work; sequence it knowingly.

### Step 0 — verify the deployment before building on it — P1

The Lovable preset passes nitro `defaultPreset: "cloudflare-module"`. It is a
_default_, so nitro's environment auto-detection should pick the `vercel`
preset when `VERCEL=1` is set — but that is an inference from the preset source
([index.js](node_modules/@lovable.dev/vite-tanstack-config/dist/index.js)), not
something observed in production. If it is wrong, the site is served as static
assets, every server function 404s, and the catalogue is empty in production.

- [x] The deployment is live at <https://portal.maharasa.id/> and answers 200,
      so a server is running — it is not being served as static assets. The
      `/_serverFn/` route exists (it answers, rather than 404ing).
- [ ] Confirm in a browser that `/_serverFn/…` returns **200** while the
      applications page loads. A raw `curl` to that route returned 403 and then
      500, but the call shape was almost certainly wrong, so this is
      unresolved rather than broken. DevTools → Network settles it.
- [ ] **Cloudflare proxies the DNS for this domain.** The bare `curl` above got
      a plain-text `Forbidden`, which looks like a WAF or bot-fight rule rather
      than the app. Verify that `/_serverFn/*` is not challenged — if it ever
      is, the catalogue goes empty for real users while the page itself still
      loads fine.
- [ ] Re-run the client-bundle leak check against the **Vercel** build output,
      not just the local Cloudflare one. The guarantee that
      [applications.ts](src/data/applications.ts) stays server-side depends on
      the dynamic `import()` surviving whatever preset actually builds.

Note while checking the above: **no route defines a loader**, so the catalogue
is fetched client-side after hydration and the server-rendered HTML contains no
applications by design. That contradicts the claim under Phase 1 above that `/`
and `/applications` "render server-side" — corrected there. Giving the routes
loaders is a separate, worthwhile change (it would remove a request waterfall
and let the catalogue appear in the initial HTML), not part of this section.

### Step 1 — decide the backend — DECIDED

**Neon Postgres, provisioned through the Vercel Marketplace.**

Why, over the alternatives that were on the table:

- **Supabase** was the other serious candidate, and its draw was the bundle:
  Postgres plus hosted auth plus file storage in one vendor. SSO is settled as
  **Keycloak** (as [README.md](README.md) has always said), so that auth
  service would be dead weight, and the bundle stops being an argument.
- **Cloudflare D1** is rejected despite Cloudflare already serving the DNS for
  `portal.maharasa.id`. Its binding is Workers-only; reaching it from Vercel
  means the account-level HTTP API and a hand-rolled token, which is more
  moving parts than Neon for less.
- **An upstream Maharasa API** stays the architecturally cleanest answer — one
  system of record, owned by IT — but it does not exist yet, and a database
  inside the corporate network is not reachable from Vercel without a tunnel.
  The port added in Step 2 means adopting it later is a new adapter, not a
  rewrite.
- **JSON in the repo, written via the GitHub API** keeps the git history but
  makes every Admin Panel save trigger a rebuild. Too slow to edit against.

Neon also gives database branching, so a Vercel preview deployment can get its
own copy rather than writing to production data.

- [ ] Decide who owns catalogue content afterwards — IT via SQL, or the
      business via the future Admin Panel. This decides whether the seed file
      stays a fallback forever or is eventually deleted.

### Step 2 — split the catalogue into a port and adapters — DONE

- [x] `CatalogStore` port defined in
      [catalog/store.ts](src/services/catalog/store.ts): `all()`, `byId()`,
      `query()`, `categories()`, all async because a remote store cannot be
      anything else.
- [x] Seed-file reads moved behind
      [catalog/seedStore.ts](src/services/catalog/seedStore.ts), now the only
      importer of [applications.ts](src/data/applications.ts). `assertUniqueIds`
      and the search filter stay in the pure layer, shared by every adapter.
- [x] [applicationCatalog.ts](src/services/applicationCatalog.ts) is now a
      resolver: it picks the active adapter through a dynamic `import()`,
      caches it per server instance, and forwards. The four selector names the
      server functions call did not change.
- [x] Contract spec in
      [catalogStoreContract.ts](src/test/catalogStoreContract.ts), replayed
      against both the seed adapter and the facade. A future Neon adapter runs
      the same suite, so it cannot quietly change what a search matches.

Verified: 115 tests pass across 18 files, `tsc --noEmit` clean, eslint and
prettier clean, production build succeeds, and `.output/public/assets/` still
contains no application URL — only the placeholder email in `TopNav`.

### Step 3 — the database adapter — MOSTLY DONE

Everything that does not need a live database is written and under test. The
adapter takes a `SqlQuery` — `(text, params) => rows` — instead of importing a
driver, which is both why it is testable without credentials and why nothing
was added to `package.json` yet.

- [x] Schema in [db/001_applications.sql](db/001_applications.sql), mirroring
      [Application](src/types/application.ts) column for column. The SSO
      columns (`requires_auth`, `auth_provider`, `auth`, `roles`,
      `permissions`) are created now, unused, so the Admin Panel does not need
      a second migration against a live table. `check` constraints keep the
      enums honest at the database as well as in zod.
- [x] Explicit `sort_order` column plus an index. Category order moved out of
      the seed file into `CATEGORY_ORDER` in
      [catalog/store.ts](src/services/catalog/store.ts), which every adapter
      answers `categories()` from — one list, so the seed file and the database
      cannot disagree about which chips exist or in what order.
- [x] Seed export: [db/exportSeed.ts](db/exportSeed.ts) generates the INSERTs
      from the live seed data (`npx vite-node db/exportSeed.ts > db/002_seed.sql`),
      so the data load never drifts from the file it came from.
      [db/002_seed.sql](db/002_seed.sql) is the current output.
- [x] Every row parsed through zod in
      [catalog/sqlStore.ts](src/services/catalog/sqlStore.ts), with the failing
      row's id in the error message. A database row is untrusted input in the
      same way a request body is — it was last written by a migration, an admin
      panel, or a person at a SQL prompt.
- [x] The adapter runs the same
      [store contract](src/test/catalogStoreContract.ts) as the seed adapter,
      so it cannot filter differently from what the portal does today.
- [x] Driver wired. `@neondatabase/serverless` is a dependency and
      [catalog/neonStore.ts](src/services/catalog/neonStore.ts) passes
      `sql.query` into `createSqlCatalogStore`. That file is deliberately four
      lines of driver call and nothing else — all behaviour stays in
      `sqlStore.ts`, where it is testable without credentials. `neon()` speaks
      HTTP rather than opening a socket, so it works unchanged in `vite dev`,
      during SSR and in the deployed function.
- [x] Adapter selection by environment: `chooseStore` in
      [catalog/config.ts](src/services/catalog/config.ts) reads `DATABASE_URL`,
      then `POSTGRES_URL` (what the Vercel Neon integration sets), and falls
      back to the seed adapter with a logged reason when neither is configured
      — so `dev` and CI keep working without a database, and a missing variable
      in production says so in the logs instead of silently serving seed data.
      It refuses a non-`postgres://` value rather than failing on the first
      query, and never consults a client-injected `VITE_`-prefixed name.
- [x] Content call, settled: applications that were commented out are now live
      in the seed file with `status: "offline"`. The catalogue is 22 entries —
      6 online, 16 offline — and the offline ones already render as
      `aria-disabled` with an explanatory tooltip. Six category chips that
      previously resolved to an empty state now have contents.
      [db/002_seed.sql](db/002_seed.sql) was regenerated from it.
- [ ] Run `001` then `002` against the Neon database.

### Step 4 — secrets and failure modes — P1

- [x] **Env vars must not carry a `VITE_` prefix.** The Lovable preset injects
      every `VITE_*` variable into the client bundle, so a prefixed connection
      string would be published to every visitor and stay valid until the
      credential was rotated.
      [clientBundleSecrets.test.ts](src/test/clientBundleSecrets.test.ts) scans
      the source for prefixed credential names and fails on one. It is a
      regression guard, written before the variable exists: it passed the day
      it was added, and its job is to fail later.
- [ ] Set `DATABASE_URL` in the Vercel project for all environments, and
      document the name in [README.md](README.md). Do not commit `.env`.
- [x] Store outage settled: **fall back to the seed catalogue**, implemented in
      [catalog/fallback.ts](src/services/catalog/fallback.ts) and applied to
      the database adapter only. The applications a failed query would hide are
      still up, and the catalogue changes by commit anyway, so failing closed
      would take the whole company's launcher down over a couple of dozen rows.
      Every failure is logged, so an outage cannot look like normal service.
      **Revisit when the Admin Panel lands** — from that point a silent
      fallback can hide an administrator's edit, and the trade changes.
- [ ] Revisit the 5-minute `staleTime` in
      [applicationService.ts](src/services/applicationService.ts) once reads
      cost a real round trip.

### Out of scope for this section

Writes. There is no create/update/delete path until the Admin Panel exists, and
the Admin Panel is blocked on SSO — shipping CRUD first would let any visitor
rewrite the company's application catalogue.

---

## Dropping bun

`bun.lock` and `bunfig.toml` were deleted and `package-lock.json` is now the
committed lockfile. `npm` is the package manager, locally and in deployment —
Vercel picks its installer from whichever lockfile it finds, so this changes
the deploy path too. The first deploy after the switch resolves dependencies
fresh; npm can pick different patch versions than bun did.

**What was lost with `bunfig.toml`, and what to do about it:**

- `minimumReleaseAge = 86400` — a supply-chain guard that refused any package
  version published less than 24 hours ago. This is the defence against a
  compromised release being installed in the window before it is caught and
  pulled. The local npm is 10.8.2, which has no equivalent setting.
  - [ ] Consider upgrading npm and setting the equivalent in `.npmrc`. Newer
        npm added a minimum-release-age option; confirm it exists in the
        version you install (`npm config ls -l | grep -i release`) rather than
        trusting this note.
- `minimumReleaseAgeExcludes` — the list of `@lovable.dev/*` packages allowed
  to bypass that guard. Only meaningful if the guard comes back.

**Also outstanding:**

- [ ] `npm audit` reports one high-severity advisory: `nanoid <3.3.18`, pulled
      in transitively by `vite → postcss`. Not fixable by bumping a direct
      dependency; it needs an `overrides` entry or a vite/postcss release that
      moves. Left alone deliberately — an override on a build-tool transitive
      is a change worth making on purpose, not as a side effect of a package
      manager switch. The advisory concerns custom generators looping when
      size is zero, which this project never calls.
- [ ] `vite-node` was added as a devDependency so `npm run db:seed-sql` runs
      from the lockfile rather than downloading a copy through `npx` each time.
