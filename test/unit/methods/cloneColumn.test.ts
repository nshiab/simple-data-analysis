import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should clone a column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([{ firstName: "nael", lastName: "shiab" }]);

  await table.cloneColumn("firstName", "firstNameCloned");

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
  ]);

  await sdb.done();
});
Deno.test("should clone a column with spaces in its name", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([{ "first name": "nael", "last name": "shiab" }]);

  await table.cloneColumn("first name", "first name cloned");

  const data = await table.getData();

  assertEquals(data, [
    { "first name": "nael", "last name": "shiab", "first name cloned": "nael" },
  ]);

  await sdb.done();
});
Deno.test("should clone a column with geometries and keep the projection", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  await table.cloneColumn("geom", "geomClone");

  assertEquals(
    table.projections["geom"],
    table.projections["geomClone"],
  );

  await sdb.done();
});
