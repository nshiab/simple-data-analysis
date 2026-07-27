import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import resolveEmbeddingProvider from "../../../src/helpers/resolveEmbeddingProvider.ts";
import { getEmbeddingCacheIdentity } from "../../../src/helpers/tryEmbedding.ts";

Deno.test("defaults embeddings to Gemini", () => {
  assertEquals(resolveEmbeddingProvider({}), "gemini");
});

Deno.test("uses OLLAMA as the legacy embeddings default", () => {
  assertEquals(resolveEmbeddingProvider({ OLLAMA: "true" }), "ollama");
});

Deno.test("uses AI_EMBEDDINGS_PROVIDER before the OLLAMA fallback", () => {
  assertEquals(
    resolveEmbeddingProvider(
      { AI_EMBEDDINGS_PROVIDER: "gemini", OLLAMA: "true" },
    ),
    "gemini",
  );
});

Deno.test("rejects an invalid AI_EMBEDDINGS_PROVIDER", () => {
  assertThrows(
    () => resolveEmbeddingProvider({ AI_EMBEDDINGS_PROVIDER: "other" }),
    Error,
    'AI_EMBEDDINGS_PROVIDER must be either "gemini" or "ollama".',
  );
});

Deno.test("separates table caches by embedding provider and model", () => {
  const ollamaIdentity = getEmbeddingCacheIdentity({
    provider: "ollama",
    model: "nomic-embed-text",
  });
  const geminiIdentity = getEmbeddingCacheIdentity({
    provider: "gemini",
    model: "gemini-embedding-001",
  });
  const otherGeminiModelIdentity = getEmbeddingCacheIdentity({
    provider: "gemini",
    model: "other-embedding-model",
  });

  assertNotEquals(ollamaIdentity, geminiIdentity);
  assertNotEquals(geminiIdentity, otherGeminiModelIdentity);
});
