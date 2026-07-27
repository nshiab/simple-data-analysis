import { assertEquals, assertThrows } from "@std/assert";
import resolveAIProvider from "../../../src/helpers/resolveAIProvider.ts";

Deno.test("defaults to Gemini", () => {
  assertEquals(resolveAIProvider({}, {}), "gemini");
});

Deno.test("uses OLLAMA as the legacy default", () => {
  assertEquals(resolveAIProvider({}, { OLLAMA: "true" }), "ollama");
});

Deno.test("uses AI_PROVIDER before the OLLAMA fallback", () => {
  assertEquals(
    resolveAIProvider({}, { AI_PROVIDER: "gemini", OLLAMA: "true" }),
    "gemini",
  );
});

Deno.test("uses per-call options before environment variables", () => {
  assertEquals(
    resolveAIProvider(
      { provider: "ollama" },
      { AI_PROVIDER: "gemini" },
    ),
    "ollama",
  );
  assertEquals(
    resolveAIProvider({ ollama: false }, { OLLAMA: "true" }),
    "gemini",
  );
});

Deno.test("rejects an invalid AI_PROVIDER", () => {
  assertThrows(
    () => resolveAIProvider({}, { AI_PROVIDER: "other" }),
    Error,
    'AI_PROVIDER must be either "gemini" or "ollama".',
  );
});
