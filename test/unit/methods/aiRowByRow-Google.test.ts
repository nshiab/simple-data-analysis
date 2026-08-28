import { assert, assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";

const geminiTest = createEnvironmentTest({ AI_PROVIDER: "gemini" });
const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
  thinkingLevel: "minimal",
  cache: false,
} as const;

if (typeof aiKey === "string" && aiKey !== "") {
  geminiTest(
    "aiRowByRow rate-limits live Gemini requests",
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("gemini_safety");
      table.loadArray([
        { city: "Marrakech" },
        { city: "Kyoto" },
        { city: "Auckland" },
      ]);
      const metrics = {
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalRequests: 0,
      };
      const requestStarts: number[] = [];
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (
        input: string | URL | Request,
        init?: RequestInit,
      ) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes("generateContent")) {
          requestStarts.push(performance.now());
        }
        return originalFetch(input, init);
      };

      try {
        await table.aiRowByRow(
          "city",
          "country",
          "Give me the country of the city.",
          {
            generation: { ...geminiGeneration, safetyEnabled: false },
            batchSize: 1,
            concurrent: 3,
            errorColumn: "error",
            metrics,
            rateLimitPerMinute: 120,
          },
        ).log();
      } finally {
        globalThis.fetch = originalFetch;
      }

      assertEquals(await table.getData(), [
        { city: "Marrakech", country: "Morocco", error: null },
        { city: "Kyoto", country: "Japan", error: null },
        { city: "Auckland", country: "New Zealand", error: null },
      ]);
      assertEquals(metrics.totalRequests, 3);
      assertEquals(requestStarts.length, 3);
      assert(requestStarts[1] - requestStarts[0] >= 400);
      assert(requestStarts[2] - requestStarts[1] >= 400);
      await sdb.close();
    },
  );

  geminiTest("aiRowByRow supports Gemini web grounding", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("gemini_grounding");
    table.loadArray([{ city: "Marrakech" }]);
    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: { ...geminiGeneration, webSearch: true },
        errorColumn: "error",
      },
    ).log();
    assertEquals(await table.getData(), [
      { city: "Marrakech", country: "Morocco", error: null },
    ]);
    await sdb.close();
  });

  geminiTest("aiRowByRow supports Gemini high thinking", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("gemini_thinking");
    table.loadArray([{ city: "Kyoto" }]);
    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: { ...geminiGeneration, thinkingLevel: "high" },
        errorColumn: "error",
      },
    ).log();
    assertEquals(await table.getData(), [{
      city: "Kyoto",
      country: "Japan",
      error: null,
    }]);
    await sdb.close();
  });
} else {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}
