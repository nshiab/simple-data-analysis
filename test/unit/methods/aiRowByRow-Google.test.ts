import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";

const geminiTest = createEnvironmentTest({ AI_PROVIDER: "gemini" });
const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
  thinkingLevel: "minimal",
} as const;

if (typeof aiKey === "string" && aiKey !== "") {
  geminiTest(
    "Gemini row processing supports safety controls and metrics",
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

      await table.aiRowByRow(
        "city",
        "country",
        "Give me the country of the city.",
        {
          generation: { ...geminiGeneration, safetyEnabled: false },
          batchSize: 3,
          metrics,
        },
      );

      assertEquals(await table.getData(), [
        { city: "Marrakech", country: "Morocco" },
        { city: "Kyoto", country: "Japan" },
        { city: "Auckland", country: "New Zealand" },
      ]);
      assertEquals(metrics.totalRequests, 1);
      await sdb.done();
    },
  );

  geminiTest("Gemini row processing supports web grounding", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("gemini_grounding");
    table.loadArray([{ city: "Marrakech" }]);
    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: { ...geminiGeneration, webSearch: true },
      },
    );
    assertEquals(await table.getData(), [
      { city: "Marrakech", country: "Morocco" },
    ]);
    await sdb.done();
  });

  geminiTest("Gemini row processing supports high thinking", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("gemini_thinking");
    table.loadArray([{ city: "Kyoto" }]);
    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: { ...geminiGeneration, thinkingLevel: "high" },
      },
    );
    assertEquals(await table.getData(), [{ city: "Kyoto", country: "Japan" }]);
    await sdb.done();
  });
} else {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}
