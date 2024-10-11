import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should calculate the length of geometries in meters", async () => {
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/line.json");
  await table.length("length");
  await table.round("length");
  await table.selectColumns("length");
  const data = await table.getData();

  assertEquals(data, [{ length: 70175 }]);
});
Deno.test("should calculate the length of geometries from a specific column in meters", async () => {
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/line.json");
  await table.length("length", { column: "geom" });
  await table.round("length");
  await table.selectColumns("length");
  const data = await table.getData();

  assertEquals(data, [{ length: 70175 }]);
});
Deno.test("should calculate the length of geometries in meters from a file loaded with option toWGS84", async () => {
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/line.json");
  await table.length("length");
  await table.round("length");
  await table.selectColumns("length");
  const data = await table.getData();

  assertEquals(data, [{ length: 70175 }]);
});
Deno.test("should calculate the length of geometries in kilometers", async () => {
  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/line.json");
  await table.length("length", { unit: "km" });
  await table.round("length");
  await table.selectColumns("length");
  const data = await table.getData();

  assertEquals(data, [{ length: 70 }]);
});

await sdb.done();
