import { test, expect } from "vite-plus/test";
import { assertRejects } from "../../helpers/assertions.ts";
import processAIRowsResponse from "../../../src/helpers/processAIRowsResponse.ts";

test("awaits processing before validating batched AI rows", async () => {
  const result = await processAIRowsResponse({ rows: [{ category: "news" }] }, 1, ["category"], {
    processResponse: async (response) => {
      await Promise.resolve();
      if (typeof response !== "object" || response === null || !("rows" in response)) {
        throw new Error("Expected rows.");
      }
      return response.rows;
    },
  });

  expect(result).toEqual([{ category: "news" }]);
});

test("rejects invalid batched AI rows", async () => {
  await assertRejects(
    () => processAIRowsResponse([{ other: "value" }], 1, ["category"], {}),
    Error,
    "missing the key 'category'",
  );
});
