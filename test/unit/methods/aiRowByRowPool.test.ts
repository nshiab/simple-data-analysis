import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

// Testing just with Gemini

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  Deno.test("should use a pool", async () => {
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
        batchSize: 2,
        cache: true,
        logProgress: true,
        metrics,
      },
    );
    await table.logTable();
    console.table(metrics);
    const data = await table.getData();

    assertEquals(data, [
      {
        city: "Marrakech",
        country: "Morocco",
        continent: "Africa",
        errors: null,
      },
      {
        city: "Kyoto",
        country: "Japan",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Auckland",
        country: "New Zealand",
        continent: "Oceania",
        errors: null,
      },
      {
        city: "Paris",
        country: "France",
        continent: "Europe",
        errors: null,
      },
      {
        city: "London",
        country: "United Kingdom",
        continent: "Europe",
        errors: null,
      },
      {
        city: "New York",
        country: "United States",
        continent: "North America",
        errors: null,
      },
      {
        city: "Los Angeles",
        country: "United States",
        continent: "North America",
        errors: null,
      },
      {
        city: "Tokyo",
        country: "Japan",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Beijing",
        country: "China",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Moscow",
        country: "Russia",
        continent: "Europe",
        errors: null,
      },
      {
        city: "Berlin",
        country: "Germany",
        continent: "Europe",
        errors: null,
      },
    ]);
    await sdb.done();
  });
  Deno.test("should use a pool and return cached data", async () => {
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
        batchSize: 2,
        cache: true,
        logProgress: true,
        metrics,
      },
    );
    await table.logTable();
    console.table(metrics);
    const data = await table.getData();

    assertEquals(data, [
      {
        city: "Marrakech",
        country: "Morocco",
        continent: "Africa",
        errors: null,
      },
      {
        city: "Kyoto",
        country: "Japan",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Auckland",
        country: "New Zealand",
        continent: "Oceania",
        errors: null,
      },
      {
        city: "Paris",
        country: "France",
        continent: "Europe",
        errors: null,
      },
      {
        city: "London",
        country: "United Kingdom",
        continent: "Europe",
        errors: null,
      },
      {
        city: "New York",
        country: "United States",
        continent: "North America",
        errors: null,
      },
      {
        city: "Los Angeles",
        country: "United States",
        continent: "North America",
        errors: null,
      },
      {
        city: "Tokyo",
        country: "Japan",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Beijing",
        country: "China",
        continent: "Asia",
        errors: null,
      },
      {
        city: "Moscow",
        country: "Russia",
        continent: "Europe",
        errors: null,
      },
      {
        city: "Berlin",
        country: "Germany",
        continent: "Europe",
        errors: null,
      },
    ]);
    await sdb.done();
  });
  Deno.test("should analyze sentiment with test function and retry - docs example 1", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    // New table with a "review" column.
    await table.loadArray([
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
        cache: true,
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

    await sdb.done();
  });

  Deno.test("should extract multiple properties - docs example 2", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
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
        logProgress: true,
        cache: true,
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

    await sdb.done();
  });

  Deno.test("should handle errors gracefully without throwing", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
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
        cache: true,
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
    await sdb.done();
  });

  Deno.test("should work with single column output and batch size 1", async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable("data");
    await table.loadArray([
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
        cache: true,
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

    await sdb.done();
  });
} else {
  console.log("No AI_KEY or AI_PROJECT in process.env");
}
