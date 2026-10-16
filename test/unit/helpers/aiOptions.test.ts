import { test, expect } from "vite-plus/test";

import { snapshotAIOptions } from "../../../src/helpers/aiOptions.ts";

test("snapshotAIOptions captures nested mutable configuration", () => {
  const options = {
    generation: {
      files: [{ path: "before.txt", type: "text" as const }],
      geminiParameters: {
        nested: { temperature: 0.25 },
      },
    },
  };

  const snapshot = snapshotAIOptions(options);
  options.generation.files[0].path = "after.txt";
  options.generation.geminiParameters.nested.temperature = 1;

  expect(snapshot).not.toBe(options);
  expect(snapshot.generation).not.toBe(options.generation);
  expect(snapshot.generation.files).not.toBe(options.generation.files);
  expect(snapshot.generation.files[0].path).toEqual("before.txt");
  expect(snapshot.generation.geminiParameters.nested.temperature).toEqual(0.25);
});

test("snapshotAIOptions preserves intentional shared references", () => {
  const ollama = {
    chat: () => Promise.resolve({ message: { content: "" } }),
  };
  const metrics = {
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalRequests: 0,
  };
  const times = { start: Date.now() };

  const snapshot = snapshotAIOptions({
    generation: { ollama },
    metrics,
    times,
  });

  expect(snapshot.generation.ollama).toBe(ollama);
  expect(snapshot.metrics).toBe(metrics);
  expect(snapshot.times).toBe(times);
});
