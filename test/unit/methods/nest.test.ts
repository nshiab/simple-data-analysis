import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should nest rows based on a single category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { city: "Montreal", neighborhoods: "Old Montreal" },
    { city: "Montreal", neighborhoods: "Chinatown" },
    { city: "Montreal", neighborhoods: "Griffintown" },
    { city: "Toronto", neighborhoods: "Kensington Market" },
    { city: "Toronto", neighborhoods: "Liberty village" },
    { city: "Toronto", neighborhoods: "Chinatown" },
    { city: "Vancouver", neighborhoods: "Coal Harbour" },
    { city: "Vancouver", neighborhoods: "West end" },
    { city: "Vancouver", neighborhoods: "Yaletown" },
  ]);

  await table.nest("neighborhoods", " / ", "city");

  const data = await table.getData();

  assertEquals(data, [
    {
      city: "Montreal",
      neighborhoods: "Old Montreal / Chinatown / Griffintown",
    },
    {
      city: "Toronto",
      neighborhoods: "Kensington Market / Liberty village / Chinatown",
    },
    { city: "Vancouver", neighborhoods: "Coal Harbour / West end / Yaletown" },
  ]);

  await sdb.done();
});

Deno.test("should nest with multiple category columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { country: "Canada", city: "Montreal", tags: "red" },
    { country: "Canada", city: "Montreal", tags: "blue" },
    { country: "Canada", city: "Toronto", tags: "green" },
    { country: "Canada", city: "Toronto", tags: "yellow" },
    { country: "USA", city: "New York", tags: "orange" },
    { country: "USA", city: "New York", tags: "purple" },
  ]);

  await table.nest("tags", ",", ["country", "city"]);

  const data = await table.getData();

  assertEquals(data, [
    { country: "Canada", city: "Montreal", tags: "red,blue" },
    { country: "Canada", city: "Toronto", tags: "green,yellow" },
    { country: "USA", city: "New York", tags: "orange,purple" },
  ]);

  await sdb.done();
});

Deno.test("should work as inverse of unnest (round-trip test)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  // Start with nested data
  const originalData = [
    {
      city: "Montreal",
      neighborhoods: "Old Montreal / Chinatown / Griffintown",
    },
    {
      city: "Toronto",
      neighborhoods: "Kensington Market / Liberty village / Chinatown",
    },
    { city: "Vancouver", neighborhoods: "Coal Harbour / West end / Yaletown" },
  ];

  await table.loadArray(originalData);

  // Unnest to expand rows
  await table.unnest("neighborhoods", " / ");

  const unnested = await table.getData();
  assertEquals(unnested.length, 9); // 3 rows expanded to 9

  // Nest back to original structure
  await table.nest("neighborhoods", " / ", "city");

  const nested = await table.getData();
  assertEquals(nested, originalData);

  await sdb.done();
});
