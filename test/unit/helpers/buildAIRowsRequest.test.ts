import { test, expect } from "vite-plus/test";

import buildAIRowsRequest from "../../../src/helpers/buildAIRowsRequest.ts";

test("builds a shared structured row request", () => {
  const request = buildAIRowsRequest(
    [{ city: "Montréal" }, { city: "Marrakech" }],
    "city",
    ["country", "continent"],
    "Classify each city.",
    {
      generation: {
        provider: "gemini",
        systemPrompt: "Use concise labels.",
      },
      extraInstructions: "Use English names.",
    },
  );

  expect(request.prompt).toContain('[\n  "Montréal",\n  "Marrakech"\n]');
  expect(request.prompt).toContain("Use English names.");
  expect(request.systemPrompt).toContain("Use concise labels.");
  expect(request.systemPrompt).toContain("exactly 2 objects");
  expect((request.schemaJson as { items: { required: string[] } }).items.required).toEqual([
    "country",
    "continent",
  ]);
});
