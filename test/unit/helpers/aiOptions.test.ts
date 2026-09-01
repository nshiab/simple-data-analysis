import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { snapshotAIOptions } from "../../../src/helpers/aiOptions.ts";

Deno.test("snapshotAIOptions captures nested mutable configuration", () => {
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

  assertNotStrictEquals(snapshot, options);
  assertNotStrictEquals(snapshot.generation, options.generation);
  assertNotStrictEquals(snapshot.generation.files, options.generation.files);
  assertEquals(snapshot.generation.files[0].path, "before.txt");
  assertEquals(
    snapshot.generation.geminiParameters.nested.temperature,
    0.25,
  );
});

Deno.test("snapshotAIOptions preserves intentional shared references", () => {
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

  assertStrictEquals(snapshot.generation.ollama, ollama);
  assertStrictEquals(snapshot.metrics, metrics);
  assertStrictEquals(snapshot.times, times);
});
