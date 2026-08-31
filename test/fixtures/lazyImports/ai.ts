import { loaded } from "./state.ts";
loaded.push("ai");

export function askGemini() {
  return Promise.resolve({
    response: {
      query: 'CREATE TABLE "answer" AS SELECT 42::INTEGER AS answer;',
    },
    promptTokenCount: 0,
    outputTokenCount: 0,
  });
}

export function askOllama() {
  throw new Error("Unexpected Ollama request");
}

export function getEmbedding() {
  throw new Error("Unexpected embedding request");
}

export function getEmbeddingIdentity() {
  throw new Error("Unexpected embedding identity request");
}
