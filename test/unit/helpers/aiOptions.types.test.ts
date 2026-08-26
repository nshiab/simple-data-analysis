import { assertEquals } from "@std/assert";
import type {
  EnvironmentEmbeddingOptions,
  GeminiEmbeddingOptions,
  OllamaEmbeddingOptions,
  VertexEmbeddingOptions,
} from "../../../src/index.ts";
import type SimpleTable from "../../../src/class/SimpleTable.ts";

const environmentOptions: EnvironmentEmbeddingOptions = {
  model: "environment-model",
  cache: true,
};
const geminiOptions: GeminiEmbeddingOptions = {
  provider: "gemini",
  model: "gemini-model",
  apiKey: "key",
};
const vertexOptions: VertexEmbeddingOptions = {
  provider: "gemini",
  vertex: true,
  model: "vertex-model",
  project: "project",
  location: "location",
};
const ollamaOptions: OllamaEmbeddingOptions = {
  provider: "ollama",
  model: "ollama-model",
  contextWindow: 8_192,
};

const invalidGemini: GeminiEmbeddingOptions = {
  provider: "gemini",
  // @ts-expect-error Gemini embedding requests cannot use Ollama options.
  contextWindow: 8_192,
};
const invalidOllama: OllamaEmbeddingOptions = {
  provider: "ollama",
  // @ts-expect-error Ollama embedding requests cannot use Google credentials.
  apiKey: "key",
};
const invalidEnvironment: EnvironmentEmbeddingOptions = {
  // @ts-expect-error Environment-selected requests expose common fields only.
  contextWindow: 8_192,
};

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
  const dwTable: SimpleTable = table.loadDW("chart-id").selectColumns("*");
  const geoDwTable: SimpleTable = table.loadGeoDW("map-id").selectColumns("*");
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
}
void checkPublicMethodOptions;

Deno.test("SDA exports provider-specific embedding option types", () => {
  assertEquals(
    [
      environmentOptions,
      geminiOptions,
      vertexOptions,
      ollamaOptions,
      invalidGemini,
      invalidOllama,
      invalidEnvironment,
    ].length,
    7,
  );
});
