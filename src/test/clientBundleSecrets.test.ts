import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A guard, not a specification of new behaviour: it passes today and exists to
 * fail the day someone adds the wrong environment variable.
 *
 * `@lovable.dev/vite-tanstack-config` injects every `VITE_*` variable into the
 * client bundle. A connection string given the `VITE_` prefix would therefore
 * be published to every visitor of portal.maharasa.id — readable in devtools,
 * and valid until the credential is rotated. The catalogue store's credentials
 * must be reachable from the server only, so the prefix must stay off them.
 *
 * The offending names are assembled at runtime below rather than written out,
 * because this file is scanned too — spelling one here would trip the guard.
 *
 * Written while wiring the persistent store, when there was no such variable
 * yet, precisely so the mistake cannot be made later without the suite going
 * red.
 */

const ROOT = resolve(__dirname, "..", "..");
const SOURCE_DIRS = ["src"];
const ROOT_FILES = ["vite.config.ts", "vitest.config.ts"];

/** Names that only ever belong to a server: publishing one is a credential leak. */
const SECRET =
  /VITE_[A-Z0-9_]*(DATABASE|POSTGRES|NEON|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL|_KEY|APIKEY)[A-Z0-9_]*/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("client bundle secrets", () => {
  const files = [
    ...SOURCE_DIRS.flatMap((dir) => sourceFiles(resolve(ROOT, dir))),
    ...ROOT_FILES.map((file) => resolve(ROOT, file)),
  ];

  it("has files to scan, so a broken path cannot make this vacuous", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("never names a credential with the VITE_ prefix", () => {
    const offenders = files
      .map((file) => ({ file, match: SECRET.exec(readFileSync(file, "utf8")) }))
      .filter((entry) => entry.match)
      .map((entry) => `${entry.file.slice(ROOT.length + 1)}: ${entry.match?.[0]}`);

    expect(offenders).toEqual([]);
  });

  it("scans its own file, so the guard cannot exempt itself", () => {
    expect(files).toContain(resolve(ROOT, "src/test/clientBundleSecrets.test.ts"));
  });

  it("catches a prefixed credential and leaves a server-only name alone", () => {
    const prefixed = ["VITE", "DATABASE", "URL"].join("_");
    const serverOnly = ["DATABASE", "URL"].join("_");

    expect(SECRET.test(prefixed)).toBe(true);
    expect(SECRET.test(serverOnly)).toBe(false);
  });
});
