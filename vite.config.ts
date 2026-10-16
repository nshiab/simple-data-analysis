import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
    },
  },
  fmt: {
    ignorePatterns: [
      "docs/**",
      "site/**",
      "llm.md",
      "llms.txt",
      "test/data/**",
      "test/geodata/**",
      "test/output/**",
      "benchmarks/data/**",
      "benchmarks/.work/**",
      ".sda-cache/**",
    ],
  },
  test: {
    pool: "forks",
    // DuckDB also uses native threads, so bound concurrent test processes.
    maxWorkers: process.env.CI === "true" ? 2 : 4,
    setupFiles: ["./test/setup.ts"],
    testTimeout: 120000,
  },
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
  },
});
