/**
 * Domain types for the Maharasa Portal application launcher.
 *
 * These types are intentionally transport-agnostic: the same shapes are used
 * whether data comes from local seed data (Phase 1) or a REST API (Phase 2).
 */

export type AppStatus = "online" | "maintenance" | "offline";

export type AppCategory =
  | "Human Resource"
  | "IT"
  | "Finance"
  | "Production"
  | "Warehouse"
  | "Operations"
  | "Sales"
  | "Management"
  | "Administration";

/** How the portal hands the user off to the target application. */
export type LaunchType = "new_tab" | "same_tab" | "embedded";

/** Reserved for Phase 2 (SSO). Not surfaced in the UI yet. */
export type AuthProvider = "keycloak" | "azure_ad" | "google" | "custom_oidc" | null;

/**
 * Phase 2 placeholder. Present on the model so that adding SSO later does not
 * require touching components, services, or the data layer contract.
 */
export interface AppAuthConfig {
  clientId?: string | null;
  clientSecret?: string | null;
  realm?: string | null;
  redirectUri?: string | null;
  scopes?: string[];
}

export interface Application {
  id: string;
  name: string;
  description: string;
  url: string;
  /** Lucide icon name, resolved at render time. */
  icon: string;
  category: AppCategory;
  status: AppStatus;
  favorite: boolean;
  color: string;
  lastOpened: string | null;
  requiresAuth: boolean;
  authProvider: AuthProvider;
  launchType: LaunchType;
  /** Phase 2: SSO client configuration. */
  auth?: AppAuthConfig;
  /** Phase 2: role-based visibility. */
  roles?: string[];
  /** Phase 2: permission-based visibility. */
  permissions?: string[];
}

export interface ApplicationQuery {
  search?: string;
  category?: AppCategory | null;
  status?: AppStatus | null;
}
