import { assertEquals, assertThrows } from "@std/assert";
import resolveAIProvider from "../../../src/helpers/resolveAIProvider.ts";

Deno.test("defaults to Gemini", () => {
  assertEquals(resolveAIProvider({}), "gemini");
});

Deno.test("ignores OLLAMA", () => {
  assertEquals(resolveAIProvider({ OLLAMA: "true" }), "gemini");
});

Deno.test("rejects an invalid AI_PROVIDER", () => {
  assertThrows(
    () => resolveAIProvider({ AI_PROVIDER: "other" }),
    Error,
    'AI_PROVIDER must be either "gemini" or "ollama".',
  );
});
