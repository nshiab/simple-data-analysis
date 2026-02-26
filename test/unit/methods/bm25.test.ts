import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should sucessfully run a search", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  await table.bm25("italian food", "Dish", "Recipe", 5);

  const dishes = await table.getValues("Dish");
  assertEquals(dishes.sort(), [
    "Carbonara",
    "Escarole Soup",
    "Pizza",
    "Risotto",
    "Tiramisu",
  ]);
});
Deno.test("should sucessfully run a search with a specific stemmer", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  await table.bm25("italian food", "Dish", "Recipe", 5, {
    stemmer: "french",
  });

  const dishes = await table.getValues("Dish");
  assertEquals(dishes.sort(), [
    "Carbonara",
    "Escarole Soup",
    "Pizza",
    "Risotto",
    "Tiramisu",
  ]);
});
Deno.test("should sucessfully run a search with a specific b and k", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  await table.bm25("italian food", "Dish", "Recipe", 5, {
    k: 0.1,
    b: 0.1,
  });

  const dishes = await table.getValues("Dish");
  assertEquals(dishes.sort(), [
    "Carbonara",
    "Escarole Soup",
    "Pizza",
    "Risotto",
    "Tiramisu",
  ]);
});
Deno.test("should sucessfully run a search with output table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  const italian = await table.bm25("italian food", "Dish", "Recipe", 5, {
    outputTable: "italian",
  });

  const dishesItalian = await italian.getValues("Dish");
  assertEquals(dishesItalian.sort(), [
    "Carbonara",
    "Escarole Soup",
    "Pizza",
    "Risotto",
    "Tiramisu",
  ]);

  const allDishes = await table.getValues("Dish");
  assertEquals(allDishes.length, 336);
});
Deno.test("should not recreate index if already exists", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  const italian = await table.bm25("italian food", "Dish", "Recipe", 5, {
    outputTable: "italian",
    verbose: true,
  });
  const french = await table.bm25("french food", "Dish", "Recipe", 5, {
    outputTable: "french",
    verbose: true,
  });

  const dishesItalian = await italian.getValues("Dish");
  assertEquals(dishesItalian.sort(), [
    "Carbonara",
    "Escarole Soup",
    "Pizza",
    "Risotto",
    "Tiramisu",
  ]);

  const dishesFrench = await french.getValues("Dish");
  assertEquals(dishesFrench.sort(), [
    "Chivito",
    "Crepes",
    "Lomo Saltado",
    "Poutine",
    "Quiche Lorraine",
  ]);

  const allDishes = await table.getValues("Dish");
  assertEquals(allDishes.length, 336);
});

Deno.test("should recreate index with overwriteIndex option", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });

  // First search creates the index
  await table.bm25("italian food", "Dish", "Recipe", 5, {
    stemmer: "porter",
    outputTable: "italian",
  });

  const indexCountBefore =
    table.indexes.filter((idx) => idx.includes("fts_index")).length;
  assertEquals(indexCountBefore, 1);

  // Second search with overwriteIndex recreates the index
  const french = await table.bm25("french food", "Dish", "Recipe", 5, {
    stemmer: "english",
    overwriteIndex: true,
    outputTable: "french",
    verbose: true,
  });

  const indexCountAfter =
    table.indexes.filter((idx) => idx.includes("fts_index")).length;

  // Should still have only one index
  assertEquals(indexCountAfter, 1);

  const dishesFrench = await french.getValues("Dish");
  assertEquals(dishesFrench.length, 5);
});
Deno.test("should include the score column when scoreColumn option is provided", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  await table.bm25("italian food", "Dish", "Recipe", 5, {
    scoreColumn: "bm25_score",
  });

  const scores = await table.getValues("bm25_score");
  const dishes = await table.getValues("Dish");

  assertEquals(scores.length, 5);
  assertEquals(typeof scores[0], "number");
  assertEquals(dishes.length, 5);
});

Deno.test("should filter out results below minScore", async () => {
  const sdb = new SimpleDB();

  // First, run a standard search to get a baseline score to test against
  const baseTable = sdb.newTable();
  await baseTable.loadData("test/data/files/recipes.parquet");
  await baseTable.removeDuplicates({ on: "Dish" });
  await baseTable.bm25("italian food", "Dish", "Recipe", 5, {
    scoreColumn: "score",
  });

  const allScores = await baseTable.getValues("score") as number[];

  // Grab the 3rd highest score to use as our minimum threshold
  // This guarantees the new search should return fewer than 5 results
  const threshold = allScores[2];

  const table = sdb.newTable();
  await table.loadData("test/data/files/recipes.parquet");
  await table.removeDuplicates({ on: "Dish" });
  await table.bm25("italian food", "Dish", "Recipe", 5, {
    minScore: threshold,
    scoreColumn: "filtered_score",
  });

  const filteredScores = await table.getValues("filtered_score") as number[];
  const dishes = await table.getValues("Dish");

  // It should only return the top 3 items that met or exceeded the threshold
  assertEquals(filteredScores.length, 3);
  assertEquals(dishes.length, 3);

  // Verify every returned score respects the minScore condition
  const allValid = filteredScores.every((score) => score >= threshold);
  assertEquals(allValid, true);
});
