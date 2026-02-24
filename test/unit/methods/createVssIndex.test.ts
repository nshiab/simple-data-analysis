import { assertEquals, assertExists } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should successfully create a VSS index", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  // Create a table with embedding data (FLOAT array)
  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
    { id: 3, embedding: [0.7, 0.8, 0.9] },
  ]);

  // Create VSS index
  const result = await table.createVssIndex("embedding");

  // Should return the table for chaining
  assertEquals(result, table);

  // Index should be in the indexes array
  assertExists(
    table.indexes.find((idx) => idx.includes("vss_cosine_index")),
  );
});

Deno.test("should not recreate index if already exists", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
  ]);

  // Create VSS index
  await table.createVssIndex("embedding", {
    verbose: true,
  });

  const indexCountBefore =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;

  // Try to create the same index again
  await table.createVssIndex("embedding", {
    verbose: true,
  });

  const indexCountAfter =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;

  // Should have the same number of indexes (no duplicate)
  assertEquals(indexCountBefore, indexCountAfter);
  assertEquals(indexCountBefore, 1);
});

Deno.test("should recreate index when overwrite is true", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
  ]);

  // Create initial VSS index
  await table.createVssIndex("embedding");

  // Index should exist
  const indexCountBefore =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;
  assertEquals(indexCountBefore, 1);

  // Recreate index with overwrite=true
  await table.createVssIndex("embedding", {
    overwrite: true,
  });

  // Index should still exist (only one)
  const indexCountAfter =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;
  assertEquals(indexCountAfter, 1);
});

Deno.test("should create index when overwrite is true and no index exists", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
  ]);

  // Create index with overwrite=true even though no index exists
  await table.createVssIndex("embedding", {
    overwrite: true,
  });

  // Index should be created
  assertExists(
    table.indexes.find((idx) => idx.includes("vss_cosine_index")),
  );
});

Deno.test("should recreate index with verbose logging when overwrite is true", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
  ]);

  // Create initial index
  await table.createVssIndex("embedding", {
    verbose: true,
  });

  const indexCountBefore =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;

  // Recreate with overwrite
  await table.createVssIndex("embedding", {
    overwrite: true,
    verbose: true,
  });

  const indexCountAfter =
    table.indexes.filter((idx) => idx.includes("vss_cosine_index")).length;

  // Should still have exactly one index
  assertEquals(indexCountBefore, 1);
  assertEquals(indexCountAfter, 1);
});

Deno.test("should create index with custom HNSW parameters", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadArray([
    { id: 1, embedding: [0.1, 0.2, 0.3] },
    { id: 2, embedding: [0.4, 0.5, 0.6] },
    { id: 3, embedding: [0.7, 0.8, 0.9] },
  ]);

  // Create VSS index with custom HNSW parameters
  const result = await table.createVssIndex("embedding", {
    efConstruction: 256,
    efSearch: 128,
    M: 32,
  });

  // Should return the table for chaining
  assertEquals(result, table);

  // Index should be in the indexes array
  assertExists(
    table.indexes.find((idx) => idx.includes("vss_cosine_index")),
  );
});
