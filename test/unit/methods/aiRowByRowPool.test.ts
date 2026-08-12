import { assert, assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";
import * as z from "zod";

// Testing just with Gemini

const geminiGeneration = {
  provider: "gemini",
  model: "gemini-3-flash-preview",
} as const;

const cities = [
  "Marrakech",
  "Kyoto",
  "Auckland",
  "Paris",
  "London",
  "New York",
  "Los Angeles",
  "Tokyo",
  "Beijing",
  "Moscow",
  "Berlin",
];

function assertPoolData(data: Record<string, unknown>[]) {
  assertEquals(data.map((row) => row.city), cities);
  for (const row of data) {
    assert(typeof row.country === "string");
    assert(typeof row.continent === "string");
    assertEquals(row.errors, null);
  }
}

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should use a pool", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray(cities.map((city) => ({ city })));

    const metrics = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalRequests: 0,
    };

    await table.aiRowByRowPool(
      "city",
      ["country", "continent"],
      "errors",
      `Give me the country and continent of the city.`,
      2,
      {
        generation: { ...geminiGeneration, cache: true },
        batchSize: 2,
        logProgress: true,
        metrics,
      },
    );
    await table.log();
    console.table(metrics);
    const data = await table.getData();

    assertPoolData(data);
    await sdb.close();
  });
  Deno.test("should use a pool and return cached data", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray(cities.map((city) => ({ city })));

    const metrics = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalRequests: 0,
    };

    await table.aiRowByRowPool(
      "city",
      ["country", "continent"],
      "errors",
      `Give me the country and continent of the city.`,
      2,
      {
        generation: { ...geminiGeneration, cache: true },
        batchSize: 2,
        logProgress: true,
        metrics,
      },
    );
    await table.log();
    console.table(metrics);
    const data = await table.getData();

    assertPoolData(data);
    await sdb.close();
  });
  Deno.test("should analyze sentiment with test function and retry - docs example 1", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    // New table with a "review" column.
    table.loadArray([
      { review: "Great product!" },
      { review: "Terrible quality." },
      { review: "Not bad, could be better." },
      { review: "Excellent service!" },
    ]);

    // Analyze sentiment using a pool with 2 concurrent workers, batch size of 2
    await table.aiRowByRowPool(
      "review",
      "sentiment",
      "error",
      `Classify the sentiment as "Positive", "Negative", or "Neutral".`,
      2, // poolSize: 2 concurrent requests
      {
        generation: { ...geminiGeneration, cache: true },
        batchSize: 2, // Process 2 rows per request
        logProgress: true,
        test: (data: { [key: string]: unknown }) => {
          if (
            typeof data.sentiment !== "string" ||
            !["Positive", "Negative", "Neutral"].includes(data.sentiment)
          ) {
            throw new Error(`Invalid sentiment: ${data.sentiment}`);
          }
        },
        retry: 2,
        minRequestDurationMs: 1000, // Respect rate limits: at least 1 second per request
      },
    );

    const data = await table.getData();

    // Check structure
    assertEquals(data.length, 4);
    for (const row of data) {
      assertEquals(typeof row.review, "string");
      assertEquals(typeof row.sentiment, "string");
      assertEquals(row.error, null);
      assertEquals(
        ["Positive", "Negative", "Neutral"].includes(row.sentiment as string),
        true,
      );
    }

    await sdb.close();
  });

  Deno.test("should extract multiple properties - docs example 2", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray([
      { product: "Laptop" },
      { product: "Smartphone" },
      { product: "Tablet" },
    ]);

    // Extract multiple properties using pool-based processing
    await table.aiRowByRowPool(
      "product",
      ["category", "typical_price_range"],
      "error",
      `For the given product, provide the category and typical price range.`,
      3, // Process up to 3 products concurrently
      {
        generation: { ...geminiGeneration, cache: true },
        logProgress: true,
      },
    );

    const data = await table.getData();

    // Check structure
    assertEquals(data.length, 3);
    for (const row of data) {
      assertEquals(typeof row.product, "string");
      assertEquals(typeof row.category, "string");
      assertEquals(typeof row.typical_price_range, "string");
      assertEquals(row.error, null);
    }

    await sdb.close();
  });

  Deno.test("should handle errors gracefully without throwing", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray([
      { text: "Valid input" },
      { text: "Another valid input" },
    ]);

    const metrics = {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalRequests: 0,
    };

    // Use a test function that always fails to simulate errors
    await table.aiRowByRowPool(
      "text",
      "result",
      "error",
      `Give me a result.`,
      2,
      {
        generation: { ...geminiGeneration, cache: true },
        logProgress: true,
        batchSize: 1,
        test: (_data: { [key: string]: unknown }) => {
          throw new Error("Simulated test failure");
        },
        retry: 1, // Try once more
        metrics,
      },
    );

    const data = await table.getData();

    // All rows should have errors but the table should still exist
    assertEquals(data.length, 2);
    for (const row of data) {
      assertEquals(typeof row.text, "string");
      assertEquals(row.result, null); // Failed requests return null
      // Error column should contain error message
      assertEquals(typeof row.error, "string");
      assertEquals(
        (row.error as string).includes("Simulated test failure"),
        true,
      );
    }

    console.table(metrics);
    await sdb.close();
  });

  Deno.test("should work with single column output and batch size 1", async () => {
    const sdb = new SimpleDB({ dataTransport: "file" });
    const table = sdb.newTable("data");
    table.loadArray([
      { name: "Marie" },
      { name: "John" },
      { name: "Alex" },
    ]);

    await table.aiRowByRowPool(
      "name",
      "gender",
      "error",
      `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
      2,
      {
        generation: { ...geminiGeneration, cache: true },
        batchSize: 1,
        test: (data: { [key: string]: unknown }) => {
          if (
            typeof data.gender !== "string" ||
            !["Man", "Woman", "Neutral"].includes(data.gender)
          ) {
            throw new Error(`Invalid response: ${data.gender}`);
          }
        },
        retry: 3,
      },
    );

    const data = await table.getData();

    assertEquals(data.length, 3);
    for (const row of data) {
      assertEquals(typeof row.name, "string");
      assertEquals(typeof row.gender, "string");
      assertEquals(row.error, null);
      assertEquals(
        ["Man", "Woman", "Neutral"].includes(row.gender as string),
        true,
      );
    }

    await sdb.close();
  });
  Deno.test("should use the default Zod JSON schema", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
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

    await table.aiRowByRowPool(
      "city",
      ["country", "population"],
      "error",
      `Give me the country and population of the city.`,
      100,
      {
        generation: geminiGeneration,
        batchSize: 2,
        logProgress: true,
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
    await sdb.close();
  });
  Deno.test("should accept a Zod JSON schema for structured output", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
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

    await table.aiRowByRowPool(
      "city",
      ["country", "population"],
      "error",
      `Give me the country and population of the city.`,
      100,
      {
        generation: { ...geminiGeneration, schemaJson },
        batchSize: 2,
        logProgress: true,
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
    await sdb.close();
  });
  Deno.test("should not ground using web search", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
      { "name": "Nael Shiab, CBC News" },
      { "name": "Elizabeth Haggarty, CBC News" },
      { "name": "Graeme Bruce, CBC News" },
    ]);

    await table.aiRowByRowPool(
      "name",
      "bio",
      "error",
      `Who is this?`,
      100,
      {
        generation: geminiGeneration,
        verbose: true,
      },
    );

    await table.log();

    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should ground using web search", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
      { "name": "Nael Shiab, CBC News" },
      { "name": "Elizabeth Haggarty, CBC News" },
      { "name": "Graeme Bruce, CBC News" },
    ]);

    await table.aiRowByRowPool(
      "name",
      "bio",
      "error",
      `Who is this?`,
      100,
      {
        generation: { ...geminiGeneration, webSearch: true },
        verbose: true,
      },
    );

    await table.log();

    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should think minimally by default", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
      { "birthday": "2020-01-01" },
      { "birthday": "1990-05-15" },
      { "birthday": "1985-10-30" },
    ]);

    await table.aiRowByRowPool(
      "birthday",
      "age",
      "error",
      `How old is this person? We are Feb 16, 2025.`,
      100,
      {
        generation: geminiGeneration,
        verbose: true,
      },
    );

    await table.log();

    assertEquals(true, true);
    await sdb.close();
  });
  Deno.test("should use thinking level high", async () => {
    const sdb = new SimpleDB({ dataTransport: "file", logDuration: true });
    const table = sdb.newTable("data");
    table.loadArray([
      { "birthday": "2020-01-01" },
      { "birthday": "1990-05-15" },
      { "birthday": "1985-10-30" },
    ]);

    await table.aiRowByRowPool(
      "birthday",
      "age",
      "error",
      `How old is this person? We are Feb 16, 2025.`,
      100,
      {
        generation: { ...geminiGeneration, thinkingLevel: "high" },
        verbose: true,
      },
    );

    await table.log();

    assertEquals(true, true);
    await sdb.close();
  });
} else {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}

const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  Deno.test(
    "should use an Ollama generation pool",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB({ dataTransport: "file" });
      const table = sdb.newTable("data");
      table.loadArray([
        { city: "Marrakech" },
        { city: "Kyoto" },
      ]);

      await table.aiRowByRowPool(
        "city",
        "country",
        "error",
        "Give me the country of the city.",
        2,
        {
          generation: { provider: "ollama" },
          batchSize: 1,
        },
      );

      const data = await table.getData();
      assertEquals(data.length, 2);
      assertEquals(data.every((row) => typeof row.country === "string"), true);
      assertEquals(data.every((row) => row.error === null), true);
      await sdb.close();
    },
  );
}
