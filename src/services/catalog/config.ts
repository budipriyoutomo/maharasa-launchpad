/**
 * Which catalogue store this deployment runs on, decided from the environment.
 *
 * Kept as a pure function over an env object rather than reading `process.env`
 * directly, so the decision is specified by a test instead of by whatever
 * happens to be set on the machine running it.
 */
export type StoreChoice =
  { kind: "sql"; connectionString: string } | { kind: "seed"; reason: string };

/**
 * `DATABASE_URL` first, then `POSTGRES_URL` — the Vercel Neon integration sets
 * the latter automatically, while the former is what someone configures on
 * purpose, and an explicit choice should win over an inherited one.
 *
 * `VITE_`-prefixed names are deliberately not consulted: the Lovable preset
 * injects those into the client bundle, so honouring one would mean reading a
 * credential that had already been published to every visitor. See
 * `src/test/clientBundleSecrets.test.ts`.
 */
const CONNECTION_KEYS = ["DATABASE_URL", "POSTGRES_URL"] as const;

export function chooseStore(env: Record<string, string | undefined>): StoreChoice {
  for (const key of CONNECTION_KEYS) {
    const value = env[key]?.trim();
    if (!value) continue;

    if (!/^postgres(ql)?:\/\//i.test(value)) {
      return {
        kind: "seed",
        reason: `${key} is set but is not a postgres:// connection string — refusing it rather than failing on the first query.`,
      };
    }

    return { kind: "sql", connectionString: value };
  }

  return {
    kind: "seed",
    reason: `No DATABASE_URL or POSTGRES_URL configured — serving the seed catalogue.`,
  };
}
