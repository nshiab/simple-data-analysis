import { test, expect, vi } from "vite-plus/test";
import processAIRowsResponse from "../../../src/helpers/processAIRowsResponse.ts";

test("awaits each row processor and preserves batch order", async () => {
  const seen: unknown[] = [];
  const result = await processAIRowsResponse(
    [{ category: " news " }, { category: " sport " }],
    2,
    ["category"],
    {
      processResponse: async (row) => {
        await Promise.resolve();
        seen.push(row);
        if (typeof row.category !== "string") throw new Error("Expected a category.");
        return { category: row.category.trim() };
      },
    },
  );
  expect(seen).toEqual([{ category: " news " }, { category: " sport " }]);
  expect(result).toEqual([{ category: "news" }, { category: "sport" }]);
});

test("validates requested columns after row processing", async () => {
  expect(
    await processAIRowsResponse([{ raw: "news" }], 1, ["category"], {
      processResponse: (row) => ({ category: row.raw }),
    }),
  ).toEqual([{ category: "news" }]);
  await expect(
    processAIRowsResponse([{ category: "news" }], 1, ["category"], {
      processResponse: () => ({ other: "news" }),
    }),
  ).rejects.toThrow("missing the key 'category'");
});

test("rejects malformed batches before calling the row processor", async () => {
  const processResponse = vi.fn((row: { [key: string]: unknown }) => row);
  for (const response of [{ category: "news" }, [], [null], [["news"]], ["news"]]) {
    await expect(
      processAIRowsResponse(response, 1, ["category"], {
        processResponse,
      }),
    ).rejects.toThrow();
  }
  expect(processResponse).not.toHaveBeenCalled();
});

test("rejects non-object processor results", async () => {
  for (const response of [undefined, null, "news", [{ category: "news" }]]) {
    await expect(
      processAIRowsResponse([{ category: "news" }], 1, ["category"], {
        processResponse: () => response,
      }),
    ).rejects.toThrow("processResponse must return an object");
  }
});

test("stops processing when a row rejects", async () => {
  const seen: unknown[] = [];
  await expect(
    processAIRowsResponse([{ id: 1 }, { id: 2 }, { id: 3 }], 3, ["id"], {
      processResponse: async (row) => {
        await Promise.resolve();
        seen.push(row.id);
        if (row.id === 2) throw new Error("Rejected row");
        return row;
      },
    }),
  ).rejects.toThrow("Rejected row");
  expect(seen).toEqual([1, 2]);
});
