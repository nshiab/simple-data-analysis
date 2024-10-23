import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should count the number of vertices and add the result in a new column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geodata");
  await table.loadGeoData("test/geodata/files/triangle.json");
  await table.nbVertices("nbVertices");
  await table.selectColumns(["nbVertices"]);

  const data = await table.getData();

  assertEquals(data, [{ nbVertices: 4 }]);
  await sdb.done();
});

Deno.test("should count the number of vertices when checking a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("geodata");
  await table.loadGeoData("test/geodata/files/triangle.json");
  await table.nbVertices("nbVertices", { column: "geom" });
  await table.selectColumns(["nbVertices"]);
  const data = await table.getData();

  assertEquals(data, [{ nbVertices: 4 }]);
  await sdb.done();
});
