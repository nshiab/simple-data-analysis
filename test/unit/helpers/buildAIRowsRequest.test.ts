import { assertEquals, assertStringIncludes } from "@std/assert";
import buildAIRowsRequest from "../../../src/helpers/buildAIRowsRequest.ts";

Deno.test("builds a shared structured row request", () => {
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

  assertStringIncludes(request.prompt, '[\n  "Montréal",\n  "Marrakech"\n]');
  assertStringIncludes(request.prompt, "Use English names.");
  assertStringIncludes(request.systemPrompt, "Use concise labels.");
  assertStringIncludes(request.systemPrompt, "exactly 2 objects");
  assertEquals(
    (request.schemaJson as { items: { required: string[] } }).items.required,
    ["country", "continent"],
  );
});
