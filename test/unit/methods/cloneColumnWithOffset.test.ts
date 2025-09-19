import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should clone a column with an offset", async () => {
  const sdb = new SimpleDB();
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

  await sdb.done();
});
Deno.test("should clone a column with an offset of 2", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { firstName: "nael", lastName: "shiab" },
    { firstName: "graeme", lastName: "bruce" },
    { firstName: "wendy", lastName: "martinez" },
    { firstName: "andrew", lastName: "ryan" },
  ]);

  await table.cloneColumnWithOffset("firstName", "nextFirstName", {
    offset: 2,
  });

  const data = await table.getData();

  assertEquals(data, [
    { firstName: "nael", lastName: "shiab", nextFirstName: "wendy" },
    { firstName: "graeme", lastName: "bruce", nextFirstName: "andrew" },
    {
      firstName: "wendy",
      lastName: "martinez",
      nextFirstName: null,
    },
    { firstName: "andrew", lastName: "ryan", nextFirstName: null },
  ]);

  await sdb.done();
});
Deno.test("should clone a column with a category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { group: "A", firstName: "nael", lastName: "shiab" },
    { group: "B", firstName: "wendy", lastName: "martinez" },
    { group: "A", firstName: "graeme", lastName: "bruce" },
    { group: "B", firstName: "andrew", lastName: "ryan" },
  ]);

  await table.cloneColumnWithOffset("firstName", "nextFirstName", {
    categories: "group",
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      group: "A",
      firstName: "nael",
      lastName: "shiab",
      nextFirstName: "graeme",
    },
    {
      group: "A",
      firstName: "graeme",
      lastName: "bruce",
      nextFirstName: null,
    },
    {
      group: "B",
      firstName: "wendy",
      lastName: "martinez",
      nextFirstName: "andrew",
    },
    {
      group: "B",
      firstName: "andrew",
      lastName: "ryan",
      nextFirstName: null,
    },
  ]);

  await sdb.done();
});
Deno.test("should clone a column with an offset when working with geometries and keep the projection", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  await table.cloneColumnWithOffset("geom", "geomClone");

  assertEquals(
    table.projections["geom"],
    table.projections["geomClone"],
  );

  await sdb.done();
});
