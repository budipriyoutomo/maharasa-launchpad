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
succeeds, and both `/` and `/applications?q=…&filter=…` render server-side.

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

- [ ] Regenerate `bun.lock`. Vitest and Testing Library were installed with
      `npm` because `bun` is not on this machine, so `bun.lock` does not yet
      list them. Run `bun install` before pushing. `package-lock.json` is now
      gitignored so it cannot become a committed second lockfile.
      Note: that npm install deleted the tracked `bun.lock` and `bunfig.toml`;
      both have been restored from git, but they are still pre-vitest.
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
  Swapping it for Cloudflare D1 or an upstream API is a change to
  [applicationCatalog.ts](src/services/applicationCatalog.ts) only.

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
