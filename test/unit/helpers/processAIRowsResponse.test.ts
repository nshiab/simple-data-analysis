import { assertEquals, assertThrows } from "@std/assert";
import processAIRowsResponse from "../../../src/helpers/processAIRowsResponse.ts";

Deno.test("cleans and validates batched AI rows", () => {
  const tested: { [key: string]: unknown }[] = [];
  const result = processAIRowsResponse(
    { rows: [{ category: "news" }] },
    1,
    ["category"],
    {
      clean: (response) =>
        (response as { rows: { [key: string]: unknown }[] }).rows,
      test: (row) => tested.push(row),
    },
  );

  assertEquals(result, [{ category: "news" }]);
  assertEquals(tested, result);
});

Deno.test("rejects invalid batched AI rows", () => {
  assertThrows(
    () => processAIRowsResponse([{ other: "value" }], 1, ["category"], {}),
    Error,
    "missing the key 'category'",
  );
});
