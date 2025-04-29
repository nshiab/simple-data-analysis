import "jsr:@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const aiKey = Deno.env.get("AI_KEY");
if (typeof aiKey === "string" && aiKey !== "") {
  Deno.test("should iterate over rows with a prompt", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and be verbose", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and respect a rate limit", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { verbose: true, rateLimitPerMinute: 15 },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and estimate a cost", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { verbose: true, rateLimitPerMinute: 15, costEstimate: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}
