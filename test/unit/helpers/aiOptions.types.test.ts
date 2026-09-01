import { assertEquals } from "@std/assert";
import SimpleTable from "../../../src/class/SimpleTable.ts";

class _SpecializedTable extends SimpleTable {
  specializedMethod(): this {
    return this;
  }
}

const environmentOptions = {
  model: "environment-model",
  cache: true,
};
const geminiOptions = {
  provider: "gemini",
  model: "gemini-model",
  apiKey: "key",
} as const;
const vertexOptions = {
  provider: "gemini",
  vertex: true,
  model: "vertex-model",
  project: "project",
  location: "location",
} as const;
const ollamaOptions = {
  provider: "ollama",
  model: "ollama-model",
  contextWindow: 8_192,
} as const;

function checkPublicMethodOptions(table: SimpleTable): void {
  const embeddingsTable: SimpleTable = table.aiEmbeddings(
    "text",
    "text_embeddings",
    {
      embeddings: vertexOptions,
    },
  ).selectColumns("*");
  const vectorTable: SimpleTable = table.aiVectorSimilarity(
    "query",
    "text_embeddings",
    5,
  ).selectColumns("*");
  const hybridTable: SimpleTable = table.hybridSearch(
    "query",
    "id",
    "text",
    5,
    {
      embeddings: ollamaOptions,
    },
  ).selectColumns("*");
  const queryTable: SimpleTable = table.aiQuery("select rows").selectColumns(
    "*",
  );
  const sheetTable: SimpleTable = table.loadSheet("https://example.com/sheet")
    .selectColumns("*");
  const dwTable: SimpleTable = table.loadDatawrapper("chart-id").selectColumns(
    "*",
  );
  const geoDwTable: SimpleTable = table.loadGeoDatawrapper("map-id")
    .selectColumns("*");
  void [
    embeddingsTable,
    vectorTable,
    hybridTable,
    queryTable,
    sheetTable,
    dwTable,
    geoDwTable,
  ];

  void table.aiEmbeddings("text", "text_embeddings", {
    embeddings: vertexOptions,
  }).run();
  void table.hybridSearch("query", "id", "text", 5, {
    embeddings: ollamaOptions,
  }).run();
  void table.aiEmbeddings("text", "text_embeddings", {
    embeddings: {
      provider: "ollama",
      // @ts-expect-error SDA methods preserve upstream provider restrictions.
      apiKey: "key",
    },
  }).run();
  void table.hybridSearch("query", "id", "text", 5, {
    embeddings: {
      provider: "gemini",
      // @ts-expect-error SDA methods preserve upstream provider restrictions.
      contextWindow: 8_192,
    },
  }).run();
  void table.aiEmbeddings("text", "text_embeddings", {
    // @ts-expect-error Environment-selected requests expose common fields only.
    embeddings: {
      contextWindow: 8_192,
    },
  }).run();
}
void checkPublicMethodOptions;

function checkPolymorphicBuilderTypes(table: _SpecializedTable): void {
  table.aiEmbeddings("text", "text_embeddings").specializedMethod();
  table.aiVectorSimilarity("query", "text_embeddings", 5)
    .specializedMethod();
  table.hybridSearch("query", "id", "text", 5).specializedMethod();
  table.aiQuery("select rows").specializedMethod();
  table.loadSheet("https://example.com/sheet").specializedMethod();
  table.loadDatawrapper("chart-id").specializedMethod();
  table.loadGeoDatawrapper("map-id").specializedMethod();

  table.aiVectorSimilarity(
    "query",
    "text_embeddings",
    5,
    { outputTable: "vector-output" },
  ).specializedMethod();
  table.hybridSearch(
    "query",
    "id",
    "text",
    5,
    { outputTable: "hybrid-output" },
  ).specializedMethod();
  table.aiQuery("select rows", {
    outputTable: "query-output",
  }).specializedMethod();
}
void checkPolymorphicBuilderTypes;

Deno.test("public AI methods preserve provider-specific embedding options", () => {
  assertEquals(
    [
      environmentOptions,
      geminiOptions,
      vertexOptions,
      ollamaOptions,
    ].length,
    4,
  );
});

Deno.test("the public index does not export type aliases", async () => {
  const indexSource = await Deno.readTextFile(
    new URL("../../../src/index.ts", import.meta.url),
  );
  assertEquals(/\bexport\s+type\b/.test(indexSource), false);
});
