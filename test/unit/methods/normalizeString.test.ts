import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import normalizeString from "../../../src/methods/normalizeString.ts";

Deno.test("normalizeString - convert to lowercase and strip punctuation", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "Hello, World!" },
    { text: "HELLO" },
    { text: "hElLo" },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "hello world");
  assertEquals(results[1].normalized, "hello");
  assertEquals(results[2].normalized, "hello");
});

Deno.test("normalizeString - strip punctuation keeps alphanumeric", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "100%" },
    { text: "email@example.com" },
    { text: "multi-word-string" },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "100");
  assertEquals(results[1].normalized, "emailexamplecom");
  assertEquals(results[2].normalized, "multiwordstring");
});

Deno.test("normalizeString - keep punctuation option", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "Hello, World!" },
    { text: "100%" },
  ]);

  await normalizeString(table, "text", "normalized", {
    stripPunctuation: false,
  });

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "hello, world!");
  assertEquals(results[1].normalized, "100%");
});

Deno.test("normalizeString - trim and normalize whitespace", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "  hello  " },
    { text: "\tworld\n" },
    { text: "  multiple   spaces  " },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "hello");
  assertEquals(results[1].normalized, "world");
  assertEquals(results[2].normalized, "multiple spaces");
});

Deno.test("normalizeString - NULL handling", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "Hello" },
    { text: null },
    { text: "World" },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string | null;
    normalized: string | null;
  }[];

  assertEquals(results[0].normalized, "hello");
  assertEquals(results[1].normalized, null);
  assertEquals(results[2].normalized, "world");
});

Deno.test("normalizeString - empty and whitespace-only strings", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "" },
    { text: "   " },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "");
  assertEquals(results[1].normalized, "");
});

Deno.test("normalizeString - special patterns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "email@example.com" },
    { text: "price: $99.99" },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized, "emailexamplecom");
  assertEquals(results[1].normalized, "price 9999");
});

Deno.test("normalizeString - mixed string types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "Hello" },
    { text: "123" },
    { text: "World" },
    { text: null },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string | null;
    normalized: string | null;
  }[];

  assertEquals(results[0].normalized, "hello");
  assertEquals(results[1].normalized, "123");
  assertEquals(results[2].normalized, "world");
  assertEquals(results[3].normalized, null);
});

Deno.test("normalizeString - long strings", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  const longText = "Hello " + "World ".repeat(10000) + "!";
  await table.loadArray([{ text: longText }]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
  }[];

  assertEquals(results[0].normalized.charAt(0), "h");
  assertEquals(typeof results[0].normalized, "string");
});

Deno.test("normalizeString - matches journalism-format core tests", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("test");
  await table.loadArray([
    { text: "Évènement!", expected: "evenement" },
    { text: "Café?", expected: "cafe" },
    { text: "Niño!", expected: "nino" },
    { text: " façade... ", expected: "facade" },
    { text: "ÖBB (Austria)", expected: "obb austria" },
    { text: "", expected: "" },
    { text: "Hello, World!", expected: "hello world" },
    { text: "Wait... what?", expected: "wait what" },
    { text: "100%", expected: "100" },
    { text: "email@example.com", expected: "emailexamplecom" },
    { text: "multi-word-string", expected: "multiwordstring" },
    { text: "underscore_test", expected: "underscoretest" },
  ]);

  await normalizeString(table, "text", "normalized");

  const results = await table.getData() as {
    text: string;
    normalized: string;
    expected: string;
  }[];

  for (const row of results) {
    assertEquals(row.normalized, row.expected);
  }
});
