import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import * as z from "zod";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should successfully run the code example", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    // New table with column "name".
    await table.loadArray([
      { name: "Marie" },
      { name: "John" },
      { name: "Alex" },
    ]);

    // Ask the AI to categorize in a new column "gender".
    await table.aiRowByRow(
      "name",
      "gender",
      `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
      {
        // Cache the results locally
        cache: true,
        // Send 10 rows at once to the AI
        batchSize: 10,
        // Ensure the response contains only the expected categories
        test: (data: {
          [key: string]: unknown;
        }) => {
          if (
            typeof data.gender !== "string" ||
            !["Man", "Woman", "Neutral"].includes(data.gender)
          ) {
            throw new Error(`Invalid response ${data.gender}`);
          }
        },
        // Retry up to 3 times if the test fails
        retry: 3,
        // Avoid exceeding a rate limit by waiting between requests
        rateLimitPerMinute: 15,
        // Log details
        verbose: true,
      },
    );

    const data = await table.getData();

    assertEquals(data, [
      { name: "Marie", gender: "Woman" },
      { name: "John", gender: "Man" },
      { name: "Alex", gender: "Neutral" },
    ]);
    await sdb.done();
  });
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
  Deno.test("should iterate over rows with a prompt and add multiple columns", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      ["country", "continent"],
      `Give me the country and continent of the city.`,
      { verbose: true },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco", continent: "Africa" },
      { city: "Kyoto", country: "Japan", continent: "Asia" },
      { city: "Auckland", country: "New Zealand", continent: "Oceania" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and add multiple columns, with a bactch size greater than 1", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
    ]);
    await table.aiRowByRow(
      "city",
      ["country", "continent"],
      `Give me the country and continent of the city.`,
      { verbose: true, batchSize: 2 },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco", continent: "Africa" },
      { city: "Kyoto", country: "Japan", continent: "Asia" },
      { city: "Auckland", country: "New Zealand", continent: "Oceania" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and metrics", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
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
      `Give me the country of the city.`,
      { verbose: true, metrics },
    );
    console.table(metrics);
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt with thinking and metrics", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
      { "city": "Marrakech" },
      { "city": "Kyoto" },
      { "city": "Auckland" },
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
      `Give me the country of the city.`,
      {
        verbose: true,
        thinkingBudget: 1000,
        model: "gemini-2.5-flash",
        metrics,
      },
    );
    console.table(metrics);
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
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
  Deno.test("should iterate over rows with a prompt, a batch size and concurrent requests", async () => {
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
      { batchSize: 2, concurrent: 2, verbose: true },
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
  Deno.test("should iterate over rows with a prompt, a batch size, concurrent requests and rate limit", async () => {
    const sdb = new SimpleDB({ logDuration: true });
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
      { batchSize: 2, concurrent: 2, verbose: true, rateLimitPerMinute: 15 },
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
  Deno.test("should iterate over rows with a prompt, a batch size, concurrent requests, rate limit and cache", async () => {
    const sdb = new SimpleDB({ logDuration: true });
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
        batchSize: 2,
        concurrent: 2,
        verbose: true,
        rateLimitPerMinute: 15,
        cache: true,
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
  Deno.test("should use the default Zod JSON schema", async () => {
    const sdb = new SimpleDB({ logDuration: true });
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
      ["country", "population"],
      `Give me the country and population of the city.`,
      {
        batchSize: 100,
        verbose: true,
      },
    );
    const data = await table.getData();

    assertEquals(data.length, 11);
    assertEquals(
      data.map((d) => d.city).every((city) => typeof city === "string"),
      true,
    );
    assertEquals(
      data.map((d) => d.country).every((country) =>
        typeof country === "string"
      ),
      true,
    );
    assertEquals(
      data.map((d) => d.population).every((population) =>
        typeof population === "string"
      ),
      true,
    );
    await sdb.done();
  });
  Deno.test("should accept a Zod JSON schema for structured output", async () => {
    const sdb = new SimpleDB({ logDuration: true });
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

    const schemaJson = z.toJSONSchema(z.array(z.object({
      country: z.string(),
      population: z.number(),
    })));

    await table.aiRowByRow(
      "city",
      ["country", "population"],
      `Give me the country and population of the city.`,
      {
        batchSize: 100,
        schemaJson,
        verbose: true,
      },
    );
    const data = await table.getData();

    assertEquals(data.length, 11);
    assertEquals(
      data.map((d) => d.city).every((city) => typeof city === "string"),
      true,
    );
    assertEquals(
      data.map((d) => d.country).every((country) =>
        typeof country === "string"
      ),
      true,
    );
    assertEquals(
      data.map((d) => d.population).every((population) =>
        typeof population === "number"
      ),
      true,
    );
    await sdb.done();
  });
} else {
  console.log("No AI_PROJECT in process.env");
}
