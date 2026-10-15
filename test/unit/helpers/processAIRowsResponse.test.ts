import { test, expect } from "vite-plus/test";
import { assertThrows } from "../../helpers/assertions.ts";
import processAIRowsResponse from "../../../src/helpers/processAIRowsResponse.ts";

test("cleans and validates batched AI rows", () => {
  const tested: { [key: string]: unknown }[] = [];
  const result = processAIRowsResponse({ rows: [{ category: "news" }] }, 1, ["category"], {
    clean: (response) => (response as { rows: { [key: string]: unknown }[] }).rows,
    test: (row) => tested.push(row),
  });

  expect(result).toEqual([{ category: "news" }]);
  expect(tested).toEqual(result);
});

test("rejects invalid batched AI rows", () => {
  assertThrows(
    () => processAIRowsResponse([{ other: "value" }], 1, ["category"], {}),
    Error,
    "missing the key 'category'",
  );
});
