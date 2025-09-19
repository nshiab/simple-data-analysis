import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import { Ollama } from "ollama";

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
        test: (response: unknown) => {
          if (
            typeof response !== "string" ||
            !["Man", "Woman", "Neutral"].includes(response)
          ) {
            throw new Error(`Invalid response ${response}`);
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
  Deno.test("should iterate over rows with a prompt with thinking", async () => {
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
      { verbose: true, thinkingBudget: 300, model: "gemini-2.5-flash" },
    );
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
} else {
  console.log("No AI_PROJECT in process.env");
}

const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should successfully run the code example (ollama)", async () => {
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
      `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral". Return an objects with two keys in it: one with the names and the other with the genders.`,
      {
        // Cache the results locally
        cache: true,
        // Send 10 rows at once to the AI
        batchSize: 10,
        clean: (response: string) =>
          (JSON.parse(response) as { results: { gender: string }[] }).results
            .map((d) => d.gender),
        // Ensure the response contains only the expected categories
        test: (response: unknown) => {
          if (
            typeof response !== "string" ||
            !["Man", "Woman", "Neutral"].includes(response)
          ) {
            throw new Error(`Invalid response ${response}`);
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
  Deno.test("should successfully run the code example with a different ollama instance (ollama)", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    // New table with column "name".
    await table.loadArray([
      { name: "Marie" },
      { name: "John" },
      { name: "Alex" },
    ]);

    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

    // Ask the AI to categorize in a new column "gender".
    await table.aiRowByRow(
      "name",
      "gender",
      `Guess whether it's a "Man" or a "Woman" from the first names. If it could be both, return "Neutral". Return an objects with two keys in it: one with the names and the other with the genders.`,
      {
        // Cache the results locally
        cache: true,
        // Send 10 rows at once to the AI
        batchSize: 10,
        clean: (response: string) =>
          (JSON.parse(response) as { results: { gender: string }[] }).results
            .map((d) => d.gender),
        // Ensure the response contains only the expected categories
        test: (response: unknown) => {
          if (
            typeof response !== "string" ||
            !["Man", "Woman", "Neutral"].includes(response)
          ) {
            throw new Error(`Invalid response ${response}`);
          }
        },
        // Retry up to 3 times if the test fails
        retry: 3,
        // Avoid exceeding a rate limit by waiting between requests
        rateLimitPerMinute: 15,
        // Log details
        verbose: true,
        ollama,
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
  Deno.test("should successfully run the code example by returning data from the cache (ollama)", async () => {
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
      `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral". Return an objects with two keys in it: one with the names and the other with the genders.`,
      {
        // Cache the results locally
        cache: true,
        // Send 10 rows at once to the AI
        batchSize: 10,
        clean: (response: string) =>
          (JSON.parse(response) as { results: { gender: string }[] }).results
            .map((d) => d.gender),
        // Ensure the response contains only the expected categories
        test: (response: unknown) => {
          if (
            typeof response !== "string" ||
            !["Man", "Woman", "Neutral"].includes(response)
          ) {
            throw new Error(`Invalid response ${response}`);
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
  Deno.test("should iterate over rows with a prompt (ollama)", async () => {
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
      {
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
      },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt (ollama)", async () => {
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
      {
        verbose: true,
        clean: (
          response: string,
        ) => (JSON.parse(response) as { countries: string }).countries,
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
      },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and thinking (ollama)", async () => {
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
      `Give me the country of the cities.`,
      {
        verbose: true,
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        batchSize: 3,
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
      },
    );
    const data = await table.getData();

    assertEquals(data, [
      { city: "Marrakech", country: "Morocco" },
      { city: "Kyoto", country: "Japan" },
      { city: "Auckland", country: "New Zealand" },
    ]);
    await sdb.done();
  });
  Deno.test("should iterate over rows with a prompt and a batch size (ollama)", async () => {
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
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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
  Deno.test("should iterate over rows with a prompt and a batch size and cache (ollama)", async () => {
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
        cache: true,
        verbose: true,
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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
  Deno.test("should iterate over rows with a prompt and a batch size and return from cache (ollama)", async () => {
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
        cache: true,
        verbose: true,
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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
  Deno.test("should iterate over rows with a prompt with a batch size and be verbose (ollama)", async () => {
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
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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
  Deno.test("should iterate over rows with a prompt, a batch size and concurrent requests (ollama)", async () => {
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
        batchSize: 2,
        concurrent: 2,
        verbose: true,
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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

  Deno.test("should iterate over rows with a prompt, a batch size and concurrent requests and cache (ollama)", async () => {
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
        batchSize: 2,
        concurrent: 5,
        cache: true,
        verbose: true,
        clean: (response: string) => {
          const parsed = JSON.parse(response);
          return typeof parsed === "object" && parsed && "countries" in parsed
            ? parsed.countries
            : parsed;
        },
        extraInstructions:
          `If you return an object, make sure it has a "countries" key with the country names. You answer should have this shape: { countries: string[] }.`,
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
  console.log("No OLLAMA in process.env");
}
