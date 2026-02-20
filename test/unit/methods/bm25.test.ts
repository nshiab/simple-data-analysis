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
