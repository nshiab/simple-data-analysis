import { assertEquals, assertThrows } from "@std/assert";
import resolveEmbeddingProvider from "../../../src/helpers/resolveEmbeddingProvider.ts";

Deno.test("defaults embeddings to Gemini", () => {
  assertEquals(resolveEmbeddingProvider({}, {}), "gemini");
});

Deno.test("uses OLLAMA as the legacy embeddings default", () => {
  assertEquals(resolveEmbeddingProvider({}, { OLLAMA: "true" }), "ollama");
});

Deno.test("uses AI_EMBEDDINGS_PROVIDER before the OLLAMA fallback", () => {
  assertEquals(
    resolveEmbeddingProvider(
      {},
      { AI_EMBEDDINGS_PROVIDER: "gemini", OLLAMA: "true" },
    ),
    "gemini",
  );
});

Deno.test("uses per-call embeddings options before environment variables", () => {
  assertEquals(
    resolveEmbeddingProvider(
      { provider: "ollama" },
      { AI_EMBEDDINGS_PROVIDER: "gemini" },
    ),
    "ollama",
  );
  assertEquals(
    resolveEmbeddingProvider({ ollama: false }, { OLLAMA: "true" }),
    "gemini",
  );
});

Deno.test("rejects an invalid AI_EMBEDDINGS_PROVIDER", () => {
  assertThrows(
    () => resolveEmbeddingProvider({}, { AI_EMBEDDINGS_PROVIDER: "other" }),
    Error,
    'AI_EMBEDDINGS_PROVIDER must be either "gemini" or "ollama".',
  );
});
