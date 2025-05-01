import "jsr:@std/dotenv/load";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism")) {
    rmSync("./.journalism", { recursive: true });
  }

  Deno.test("should iterate over rows with a prompt and a batch size", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { batchSize: 10, verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and a batch size and cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { batchSize: 10, cache: true, verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and a batch size and return from cache", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { batchSize: 10, cache: true, verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt with a batch size and be verbose", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { batchSize: 10, verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and respect a rate limit with a batch size", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      { batchSize: 10, verbose: true, rateLimitPerMinute: 15 },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and estimate a cost with a batch size", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
      { "city": "Paris" },
      { "city": "London" },
      { "city": "New York" },
      { "city": "Los Angeles" },
      { "city": "Tokyo" },
      { "city": "Beijing" },
      { "city": "Moscow" },
      { "city": "Berlin" },
    ]);
    await table.aiRowByRow(
      "city",
      "country",
      `Give me the country of the city.`,
      {
        batchSize: 10,
        verbose: true,
        rateLimitPerMinute: 15,
      },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
      { city: "Paris", country: "France" },
      { city: "London", country: "United Kingdom" },
      { city: "New York", country: "United States" },
      { city: "Los Angeles", country: "United States" },
      { city: "Tokyo", country: "Japan" },
      { city: "Beijing", country: "China" },
      { city: "Moscow", country: "Russia" },
      { city: "Berlin", country: "Germany" },
    ]);
    await sdb.done();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}
