import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should return all pairs of rows", async () => {
  const numbers = sdb.newTable("numbers");
  await numbers.loadArray([
    { key1: 1 },
    { key1: 2 },
    { key1: 3 },
    { key1: 4 },
  ]);
  const letters = sdb.newTable("letters");
  await letters.loadArray([
    { key2: "a" },
    { key2: "b" },
    { key2: "c" },
    { key2: "d" },
  ]);
  await numbers.crossJoin(letters);
  const data = await numbers.getData();
  assertEquals(data, [
    { key1: 1, key2: "a" },
    { key1: 1, key2: "b" },
    { key1: 1, key2: "c" },
    { key1: 1, key2: "d" },
    { key1: 2, key2: "a" },
    { key1: 2, key2: "b" },
    { key1: 2, key2: "c" },
    { key1: 2, key2: "d" },
    { key1: 3, key2: "a" },
    { key1: 3, key2: "b" },
    { key1: 3, key2: "c" },
    { key1: 3, key2: "d" },
    { key1: 4, key2: "a" },
    { key1: 4, key2: "b" },
    { key1: 4, key2: "c" },
    { key1: 4, key2: "d" },
  ]);
});
Deno.test("should return all pairs of rows in a new table", async () => {
  const numbers = sdb.newTable("numbers");
  await numbers.loadArray([
    { key1: 1 },
    { key1: 2 },
    { key1: 3 },
    { key1: 4 },
  ]);
  const letters = sdb.newTable("letters");
  await letters.loadArray([
    { key2: "a" },
    { key2: "b" },
    { key2: "c" },
    { key2: "d" },
  ]);
  const joined = await numbers.crossJoin(letters, {
    outputTable: true,
  });
  const data = await joined.getData();
  assertEquals(data, [
    { key1: 1, key2: "a" },
    { key1: 1, key2: "b" },
    { key1: 1, key2: "c" },
    { key1: 1, key2: "d" },
    { key1: 2, key2: "a" },
    { key1: 2, key2: "b" },
    { key1: 2, key2: "c" },
    { key1: 2, key2: "d" },
    { key1: 3, key2: "a" },
    { key1: 3, key2: "b" },
    { key1: 3, key2: "c" },
    { key1: 3, key2: "d" },
    { key1: 4, key2: "a" },
    { key1: 4, key2: "b" },
    { key1: 4, key2: "c" },
    { key1: 4, key2: "d" },
  ]);
});
Deno.test("should return all pairs of rows in a new table with a specific name", async () => {
  const numbers = sdb.newTable("numbers");
  await numbers.loadArray([
    { key1: 1 },
    { key1: 2 },
    { key1: 3 },
    { key1: 4 },
  ]);
  const letters = sdb.newTable("letters");
  await letters.loadArray([
    { key2: "a" },
    { key2: "b" },
    { key2: "c" },
    { key2: "d" },
  ]);
  const joined = await numbers.crossJoin(letters, {
    outputTable: "joined",
  });
  const data = await joined.getData();
  assertEquals(data, [
    { key1: 1, key2: "a" },
    { key1: 1, key2: "b" },
    { key1: 1, key2: "c" },
    { key1: 1, key2: "d" },
    { key1: 2, key2: "a" },
    { key1: 2, key2: "b" },
    { key1: 2, key2: "c" },
    { key1: 2, key2: "d" },
    { key1: 3, key2: "a" },
    { key1: 3, key2: "b" },
    { key1: 3, key2: "c" },
    { key1: 3, key2: "d" },
    { key1: 4, key2: "a" },
    { key1: 4, key2: "b" },
    { key1: 4, key2: "c" },
    { key1: 4, key2: "d" },
  ]);
});
Deno.test("should return all pairs of rows and all projections", async () => {
  const point = await sdb
    .newTable()
    .loadGeoData("test/geodata/files/point.json");
  const line = await sdb
    .newTable()
    .loadGeoData("test/geodata/files/line.json");
  await line.renameColumns({ geom: "line" });

  await point.crossJoin(line);

  assertEquals(point.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    line: "+proj=latlong +datum=WGS84 +no_defs",
  });
});

await sdb.done();
