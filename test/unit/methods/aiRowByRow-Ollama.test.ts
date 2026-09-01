import { assert, assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { type ChatRequest, Ollama } from "ollama";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";

const ollamaTest = createEnvironmentTest({ AI_PROVIDER: "ollama" });
const hasOllama = Deno.env.get("AI_PROVIDER") === "ollama";

if (hasOllama) {
  ollamaTest(
    "aiRowByRow rate-limits live Ollama requests",
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("ollama_client");
      table.loadArray([
        { city: "Marrakech" },
        { city: "Kyoto" },
        { city: "Auckland" },
      ]);
      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });
      const requestStarts: number[] = [];
      const chat = ollama.chat.bind(ollama);
      Object.defineProperty(ollama, "chat", {
        configurable: true,
        writable: true,
        value: (request: ChatRequest & { stream?: false }) => {
          requestStarts.push(performance.now());
          return chat(request);
        },
      });

      await table.aiRowByRow(
        "city",
        "country",
        "Give me the country of the city.",
        {
          generation: { provider: "ollama", ollama, cache: false },
          batchSize: 1,
          concurrency: 3,
          errorColumn: "error",
          rateLimitPerMinute: 120,
        },
      ).run();

      assertEquals(await table.getData(), [
        { city: "Marrakech", country: "Morocco", error: null },
        { city: "Kyoto", country: "Japan", error: null },
        { city: "Auckland", country: "New Zealand", error: null },
      ]);
      assertEquals(requestStarts.length, 3);
      assert(requestStarts[1] - requestStarts[0] >= 400);
      assert(requestStarts[2] - requestStarts[1] >= 400);
      await sdb.close();
    },
  );

  ollamaTest("aiRowByRow supports Ollama high thinking", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("ollama_thinking");
    table.loadArray([{ city: "Kyoto" }]);
    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: {
          provider: "ollama",
          thinkingLevel: "high",
          cache: false,
        },
        errorColumn: "error",
      },
    ).run();
    assertEquals(await table.getData(), [{
      city: "Kyoto",
      country: "Japan",
      error: null,
    }]);
    await sdb.close();
  });
} else {
  console.log("AI_PROVIDER is not set to ollama");
}
