import { defineConfig } from "vitest/config";

/**
 * Separate from `vite.config.ts` on purpose: the app config extends the Lovable
 * TanStack Start preset, and unit tests need none of that machinery — only the
 * `@` alias, which Vite resolves natively from tsconfig.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
