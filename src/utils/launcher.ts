import type { Application } from "@/types/application";

/**
 * Single hand-off point to a target application.
 *
 * Phase 2 will resolve an SSO token / redirect URI here before navigating;
 * callers keep the same one-line API.
 */
export function launchApplication(app: Application): void {
  if (typeof window === "undefined") return;

  if (app.launchType === "same_tab") {
    window.location.href = app.url;
    return;
  }

  window.open(app.url, "_blank", "noopener,noreferrer");
}
