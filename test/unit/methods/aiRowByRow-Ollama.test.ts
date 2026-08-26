import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { Ollama } from "ollama";
import createEnvironmentTest from "../helpers/createEnvironmentTest.ts";

const ollamaTest = createEnvironmentTest({ AI_PROVIDER: "ollama" });
const hasOllama = Deno.env.get("AI_PROVIDER") === "ollama";

if (hasOllama) {
  ollamaTest("Ollama row processing supports a custom client", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("ollama_client");
    table.loadArray([
      { city: "Marrakech" },
      { city: "Kyoto" },
      { city: "Auckland" },
    ]);
    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

    await table.aiRowByRow(
      "city",
      "country",
      "Give me the country of the city.",
      {
        generation: { provider: "ollama", ollama, cache: false },
        batchSize: 3,
      },
    ).run();

    assertEquals(await table.getData(), [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.close();
  });

  ollamaTest("Ollama row processing supports high thinking", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
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
      },
    ).run();
    assertEquals(await table.getData(), [{ city: "Kyoto", country: "Japan" }]);
    await sdb.close();
  });
} else {
  console.log("AI_PROVIDER is not set to ollama");
}
