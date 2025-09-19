import { assertEquals } from "@std/assert";
import getName from "../../../src/helpers/getName.ts";

Deno.test("should return the file name without extension for a simple file path", function () {
  const result = getName("example.txt");
  assertEquals(result, "example");
});

Deno.test("should return the file name without extension for a nested file path", function () {
  const result = getName("path/to/example.txt");
  assertEquals(result, "example");
});

Deno.test("should return the file name without extension for a file with multiple dots", function () {
  const result = getName("path/to/example.test.js");
  assertEquals(result, "example.test");
});

Deno.test("should return an empty string for a file with no name but only extension", function () {
  const result = getName("path/to/.hiddenfile");
  assertEquals(result, "");
});

Deno.test("should handle paths with no extension", function () {
  const result = getName("path/to/example");
  assertEquals(result, "example");
});
