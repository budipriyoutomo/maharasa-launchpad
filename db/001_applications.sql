-- Maharasa Portal — application catalogue.
--
-- The columns mirror `src/types/application.ts` one for one, including the
-- fields Phase 2 SSO will need (requires_auth, auth_provider, auth, roles,
-- permissions). They are created now, unused, so that adding the Admin Panel
-- and Keycloak later is not a second migration against a live table.

create table if not exists applications (
  id            text primary key,
  name          text        not null,
  description   text        not null default '',
  url           text        not null,
  icon          text        not null,
  category      text        not null,
  status        text        not null default 'online',
  favorite      boolean     not null default false,
  color         text        not null,
  last_opened   timestamptz,

  -- Phase 2 (SSO). Written by the Admin Panel, read by launchApplication.
  requires_auth boolean     not null default false,
  auth_provider text,
  launch_type   text        not null default 'new_tab',
  auth          jsonb,
  roles         jsonb,
  permissions   jsonb,

  -- Display order is a product decision, not the engine's. Without this the
  -- grid reshuffles after an unrelated update.
  sort_order    integer     not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- The adapter re-validates every row with zod, but a typo should not reach
  -- the application in the first place. Keep these in step with
  -- `AppStatus`, `AppCategory`, `LaunchType` and `AuthProvider`.
  constraint applications_status_check
    check (status in ('online', 'maintenance', 'offline')),
  constraint applications_launch_type_check
    check (launch_type in ('new_tab', 'same_tab', 'embedded')),
  constraint applications_auth_provider_check
    check (auth_provider is null
           or auth_provider in ('keycloak', 'azure_ad', 'google', 'custom_oidc')),
  constraint applications_category_check
    check (category in ('Human Resource', 'IT', 'Finance', 'Production', 'Warehouse',
                        'Operations', 'Sales', 'Management', 'Administration'))
);

create index if not exists applications_sort_order_idx on applications (sort_order, name);
