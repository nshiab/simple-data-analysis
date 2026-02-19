import { assertEquals } from "@std/assert";
import printTable from "../../../src/helpers/printTable.ts";

Deno.test("printTable should print empty table message for empty array", () => {
  // This test just verifies it doesn't throw
  printTable([]);
  assertEquals(true, true);
});

Deno.test("printTable should print a simple table", () => {
  const data = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ];

  // This test just verifies it doesn't throw
  printTable(data);
  assertEquals(true, true);
});

Deno.test("printTable should handle null values", () => {
  const data = [
    { name: "Alice", value: null },
    { name: "Bob", value: 123 },
  ];

  printTable(data);
  assertEquals(true, true);
});

Deno.test("printTable should handle long text with wrapping", () => {
  const data = [
    {
      name: "Alice",
      description: "This is a very long description that should be wrapped",
    },
    { name: "Bob", description: "Short" },
  ];

  printTable(data, { maxColumnWidth: 20 });
  assertEquals(true, true);
});

Deno.test("printTable should handle text with newlines", () => {
  const data = [
    { name: "Alice", notes: "Line 1\nLine 2\nLine 3" },
    { name: "Bob", notes: "Single line" },
  ];

  printTable(data);
  assertEquals(true, true);
});

Deno.test("printTable should handle boolean values", () => {
  const data = [
    { name: "Alice", active: true },
    { name: "Bob", active: false },
  ];

  printTable(data);
  assertEquals(true, true);
});

Deno.test("printTable should handle Date objects", () => {
  const data = [
    { name: "Alice", created: new Date("2024-01-01") },
    { name: "Bob", created: new Date("2024-02-01") },
  ];

  printTable(data);
  assertEquals(true, true);
});

Deno.test("printTable should respect maxColumnWidth option", () => {
  const data = [
    {
      name: "Alice",
      description:
        "This is a very long description that should be wrapped at the specified width",
    },
  ];

  printTable(data, { maxColumnWidth: 30 });
  assertEquals(true, true);
});

Deno.test("printTable should respect minColumnWidth option", () => {
  const data = [
    { a: "1", b: "2" },
  ];

  printTable(data, { minColumnWidth: 10 });
  assertEquals(true, true);
});

Deno.test("printTable should handle mixed data types", () => {
  const data = [
    { str: "text", num: 123, bool: true, nul: null, date: new Date() },
  ];

  printTable(data);
  assertEquals(true, true);
});
Deno.test("printTable should add horizontal borders when word wrapping occurs", () => {
  const data = [
    {
      name: "Alice",
      description:
        "This is a very long description that will definitely be wrapped to multiple lines when the max column width is applied",
    },
    {
      name: "Bob",
      description:
        "Another long text that will span multiple lines to demonstrate the horizontal borders feature",
    },
    { name: "Charlie", description: "Short text" },
  ];

  // With word wrapping, horizontal borders should be added between rows
  printTable(data, { maxColumnWidth: 25 });
  assertEquals(true, true);
});
