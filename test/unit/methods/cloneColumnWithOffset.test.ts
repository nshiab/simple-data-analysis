import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should clone a column with an offset", async () => {
  const table = sdb.newTable("data");
  await table.loadArray([
    { firstName: "nael", lastName: "shiab" },
    { firstName: "graeme", lastName: "bruce" },
    { firstName: "wendy", lastName: "martinez" },
    { firstName: "andrew", lastName: "ryan" },
  ]);

  await table.cloneColumnWithOffset("firstName", "nextFirstName");

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "nael", lastName: "shiab", nextFirstName: "graeme" },
    { firstName: "graeme", lastName: "bruce", nextFirstName: "wendy" },
    {
      firstName: "wendy",
      lastName: "martinez",
      nextFirstName: "andrew",
    },
    { firstName: "andrew", lastName: "ryan", nextFirstName: null },
  ]);
});
Deno.test("should clone a column with an offset when working with geometries and keep the projection", async () => {
  const table = sdb.newTable("data");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  await table.cloneColumnWithOffset("geom", "geomClone");

  assertEquals(
    table.projections["geom"],
    table.projections["geomClone"],
  );
});

await sdb.done();
