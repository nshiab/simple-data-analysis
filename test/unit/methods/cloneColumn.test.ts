import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should clone a column", async () => {
  const table = sdb.newTable("data");
  await table.loadArray([{ firstName: "nael", lastName: "shiab" }]);

  await table.cloneColumn("firstName", "firstNameCloned");

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
  ]);
});

Deno.test("should clone a column with geometries and keep the projection", async () => {
  const table = sdb.newTable("data");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  await table.cloneColumn("geom", "geomClone");

  assertEquals(
    table.projections["geom"],
    table.projections["geomClone"],
  );
});

await sdb.done();
