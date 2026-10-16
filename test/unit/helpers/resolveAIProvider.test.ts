import { test, expect } from "vite-plus/test";
import { assertThrows } from "../../helpers/assertions.ts";
import resolveAIProvider from "../../../src/helpers/resolveAIProvider.ts";

test("defaults to Gemini", () => {
  expect(resolveAIProvider({})).toEqual("gemini");
});

test("ignores OLLAMA", () => {
  expect(resolveAIProvider({ OLLAMA: "true" })).toEqual("gemini");
});

test("rejects an invalid AI_PROVIDER", () => {
  assertThrows(
    () => resolveAIProvider({ AI_PROVIDER: "other" }),
    Error,
    'AI_PROVIDER must be either "gemini" or "ollama".',
  );
});
