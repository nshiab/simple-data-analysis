import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should unnest rows based on a specific column values", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/nestedData.csv");
  await table.unnest("neighbourhoods", " / ");

  const data = await table.getData();

  assertEquals(data, [
    { city: "Montreal", neighbourhoods: "Old Montreal" },
    { city: "Montreal", neighbourhoods: "Chinatown" },
    { city: "Montreal", neighbourhoods: "Griffintown" },
    { city: "Toronto", neighbourhoods: "Kensington Market" },
    { city: "Toronto", neighbourhoods: "Liberty village" },
    { city: "Toronto", neighbourhoods: "Chinatown" },
    { city: "Vancouver", neighbourhoods: "Coal Harbour" },
    { city: "Vancouver", neighbourhoods: "West end" },
    { city: "Vancouver", neighbourhoods: "Yaletown" },
  ]);

  await sdb.done();
});
