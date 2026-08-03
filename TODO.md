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
- Vitest + Testing Library configured in [vitest.config.ts](vitest.config.ts);
  29 tests cover `ApplicationService`, `useLocalStorage`, favorites/recents and
  the greeting helpers.

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
- Admin Panel — add / edit / delete / reorder applications, icon upload
- REST API data source (swap the `LocalApplicationService` body only)
