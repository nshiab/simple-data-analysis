/**
 * Provider-free whole-operation memory experiment, run in a fresh process per size:
 * deno run -A --v8-flags=--expose-gc benchmarks/aiEmbeddingsMemory.ts 10000
 *
 * Keep concurrency, text width, vector dimensions, and Core transfer size fixed.
 * Post-GC heap samples approximate live JS retention; RSS includes native memory
 * and is not a measure of JS buffering. DuckDB allocation is queried only while
 * idle, never concurrently with the enrichment callback. Elapsed time includes
 * DuckDB work and forced GC, and is not a pure scheduler comparison.
 */
import SimpleDB from "../src/class/SimpleDB.ts";

const rows = Number(Deno.args[0] ?? 10_000);
if (!Number.isSafeInteger(rows) || rows < 1) {
  throw new Error("Provide a positive safe integer row count.");
}
const gc = (globalThis as { gc?: () => void }).gc;
if (!gc) throw new Error("Run with --v8-flags=--expose-gc.");
const concurrency = 4;
const dimensions = 128;
const sdb = new SimpleDB();
let requests = 0;
let active = 0;
let peakActive = 0;
let measuring = false;
let samples = 0;
let peakHeapUsed = 0;
let peakExternal = 0;
let peakRss = 0;
function sample(): void {
  gc!();
  const memory = Deno.memoryUsage();
  peakHeapUsed = Math.max(peakHeapUsed, memory.heapUsed);
  peakExternal = Math.max(peakExternal, memory.external);
  peakRss = Math.max(peakRss, memory.rss);
  samples++;
}
const embeddings = {
  provider: "ollama" as const,
  model: "memory-experiment",
  cache: false,
  ollama: {
    embeddingEndpoint: "http://memory-experiment.local:11434",
    embed: async () => {
      peakActive = Math.max(peakActive, ++active);
      const requestNumber = ++requests;
      await Promise.resolve();
      if (measuring && requestNumber % 250 === 0) sample();
      active--;
      return { embeddings: [Array<number>(dimensions).fill(1)] };
    },
  },
};
const duckdbMemory = async () => {
  const data = await sdb.customQuery(
    "SELECT sum(memory_usage_bytes)::DOUBLE AS bytes FROM duckdb_memory()",
    { returnData: true },
  ) as { bytes: number }[];
  return data[0].bytes;
};
try {
  // Warm lazy imports and the provider adapter before measuring.
  const warm = sdb.newTable("warm");
  await warm.loadArray([{ text: "warm" }]).aiEmbeddings("text", "vector", {
    embeddings,
    concurrency,
  }).run();
  await sdb.customQuery("DROP TABLE warm");
  const table = sdb.newTable("memory_input");
  await sdb.customQuery(`CREATE TABLE memory_input AS SELECT i,
    repeat('abcdefgh', 64) AS text FROM range(${rows}) AS source(i)`);
  const duckdbBefore = await duckdbMemory();
  gc();
  const baseline = Deno.memoryUsage();
  requests = 0;
  peakActive = 0;
  measuring = true;
  sample();
  const started = performance.now();
  await table.aiEmbeddings("text", "vector", { embeddings, concurrency }).run();
  const elapsedMs = performance.now() - started;
  sample();
  const duckdbAfter = await duckdbMemory();
  console.log(JSON.stringify({
    rows,
    concurrency,
    dimensions,
    textBytes: 512,
    transferRows: 1000,
    requests,
    peakActive,
    samples,
    elapsedMs,
    baselineHeapUsed: baseline.heapUsed,
    peakPostGcHeapUsed: peakHeapUsed,
    retainedHeapDelta: peakHeapUsed - baseline.heapUsed,
    peakExternal,
    baselineRss: baseline.rss,
    peakRss,
    duckdbBefore,
    duckdbAfter,
  }));
} finally {
  await sdb.close();
}
