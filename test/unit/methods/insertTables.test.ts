import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should add rows from a table into another table", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");

  await table1.insertTables(table2);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
  await sdb.done();
});

Deno.test("should add rows from a table into another table even if the column order is not the same", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");
  await table2.selectColumns(["key2", "key1"]);

  await table1.insertTables(table2);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
  await sdb.done();
});

Deno.test("should add rows from multiple tables into another table", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadData("test/data/files/data.json");

  const table2 = sdb.newTable("table2");
  await table2.loadData("test/data/files/data.json");

  const table3 = sdb.newTable("table3");
  await table3.loadData("test/data/files/data.json");

  await table1.insertTables([table2, table3]);
  const data = await table1.getData();
  assertEquals(data, [
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
    { key1: 1, key2: "un" },
    { key1: 2, key2: "deux" },
    { key1: 3, key2: "trois" },
    { key1: 4, key2: "quatre" },
  ]);
  await sdb.done();
});
Deno.test("should add rows from tables with different columns", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadArray([
    { firstName: "John", lastName: "Doe" },
    { firstName: "Jane", lastName: "Doe" },
  ]);

  const table2 = sdb.newTable("table2");
  await table2.loadArray([
    { firstName: "Anthony", age: 25 },
    { firstName: "Eleonore", age: 22 },
  ]);

  const table3 = sdb.newTable("table3");
  await table3.loadArray([
    { city: "Montreal" },
    { city: "Toronto" },
  ]);

  await table1.insertTables([table2, table3], { unifyColumns: true });
  const data = await table1.getData();
  assertEquals(data, [
    { firstName: "John", lastName: "Doe", age: null, city: null },
    { firstName: "Jane", lastName: "Doe", age: null, city: null },
    { firstName: "Anthony", lastName: null, age: 25, city: null },
    { firstName: "Eleonore", lastName: null, age: 22, city: null },
    { firstName: null, lastName: null, age: null, city: "Montreal" },
    { firstName: null, lastName: null, age: null, city: "Toronto" },
  ]);
  await sdb.done();
});
Deno.test("should add rows from tables with different columns without adding columns to the original tables", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable("table1");
  await table1.loadArray([
    { firstName: "John", lastName: "Doe" },
    { firstName: "Jane", lastName: "Doe" },
  ]);

  const table2 = sdb.newTable("table2");
  await table2.loadArray([
    { firstName: "Anthony", age: 25 },
    { firstName: "Eleonore", age: 22 },
  ]);

  const table3 = sdb.newTable("table3");
  await table3.loadArray([
    { city: "Montreal" },
    { city: "Toronto" },
  ]);

  await table1.insertTables([table2, table3], { unifyColumns: true });
  const data = await table1.getData();
  const data2 = await table2.getData();
  const data3 = await table3.getData();
  assertEquals({ data, data2, data3 }, {
    data: [
      { firstName: "John", lastName: "Doe", age: null, city: null },
      { firstName: "Jane", lastName: "Doe", age: null, city: null },
      { firstName: "Anthony", lastName: null, age: 25, city: null },
      { firstName: "Eleonore", lastName: null, age: 22, city: null },
      { firstName: null, lastName: null, age: null, city: "Montreal" },
      { firstName: null, lastName: null, age: null, city: "Toronto" },
    ],
    data2: [
      { firstName: "Anthony", age: 25 },
      { firstName: "Eleonore", age: 22 },
    ],
    data3: [
      { city: "Montreal" },
      { city: "Toronto" },
    ],
  });
  await sdb.done();
});
Deno.test("should add rows from tables with geometries", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");

  await table1.insertTables(table2, { unifyColumns: true });

  const types = await table1.getTypes();
  const projections = table1.projections;

  assertEquals({ types, projections }, {
    types: {
      nameEnglish: "VARCHAR",
      nameFrench: "VARCHAR",
      geom: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: { geom: "+proj=latlong +datum=WGS84 +no_defs" },
  });
  await sdb.done();
});
// NOT SURE HOW TO TEST FOR ERRORS. THIS IS EXPECT BEHAVIOR BELOW.
// Deno.test("should throw an error if geometry projections are not the same", async () => {
//   const sdb = new SimpleDB();
//   const table1 = sdb.newTable();
//   await table1.loadGeoData(
//     "test/geodata/files/CanadianProvincesAndTerritories.json",
//   );

//   const table2 = sdb.newTable();
//   await table2.loadGeoData("test/geodata/files/point.json");
//   await table2.reproject("EPSG:3347");
//   await table2.latLon("geom", "lat", "lon");

//   await table1.insertTables(table2, { unifyColumns: true });

//   await sdb.done();
// });
Deno.test("should add rows with geometries to a table without geometries", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadData(
    "test/data/files/cities.csv",
  );

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");

  await table1.insertTables(table2, { unifyColumns: true });

  const types = await table1.getTypes();
  const projections = table1.projections;

  assertEquals({ types, projections }, {
    types: {
      id: "BIGINT",
      city: "VARCHAR",
      geom: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: { geom: "+proj=latlong +datum=WGS84 +no_defs" },
  });
  await sdb.done();
});
Deno.test("should add rows without geometries to a table with geometries", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadData(
    "test/data/files/cities.csv",
  );

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");

  await table2.insertTables(table1, { unifyColumns: true });

  const types = await table2.getTypes();
  const projections = table2.projections;

  assertEquals({ types, projections }, {
    types: {
      id: "BIGINT",
      city: "VARCHAR",
      geom: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: { geom: "+proj=latlong +datum=WGS84 +no_defs" },
  });
  await sdb.done();
});
Deno.test("should add rows and unify columns when the second table has more columns", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadGeoData(
    "test/geodata/files/point.json",
  );

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");

  await table1.insertTables(table2, { unifyColumns: true });

  const types = await table1.getTypes();
  const projections = table1.projections;

  assertEquals({ types, projections }, {
    types: {
      geom: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: { geom: "+proj=latlong +datum=WGS84 +no_defs" },
  });
  await sdb.done();
});
Deno.test("should add rows with tables with multiple geometry columns", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();
  await table1.loadGeoData(
    "test/geodata/files/point.json",
  );
  await table1.cloneColumn("geom", "geom2");
  await table1.reproject("EPSG:3347", { column: "geom2" });

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");
  await table2.cloneColumn("geom", "geom2");
  await table2.reproject("EPSG:3347", { column: "geom2" });

  await table1.insertTables(table2, { unifyColumns: true });

  const types = await table1.getTypes();
  const projections = table1.projections;

  assertEquals({ types, projections }, {
    types: {
      geom: "GEOMETRY",
      geom2: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: {
      geom2: "EPSG:3347",
      geom: "+proj=latlong +datum=WGS84 +no_defs",
    },
  });
  await sdb.done();
});
Deno.test("should add rows to an empty table", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();

  const table2 = sdb.newTable();
  await table2.loadArray([
    { first: "John", last: "Doe" },
    { first: "Jane", last: "Doe" },
  ]);

  await table1.insertTables(table2);

  assertEquals(await table1.getData(), [
    { first: "John", last: "Doe" },
    { first: "Jane", last: "Doe" },
  ]);
  await sdb.done();
});
Deno.test("should add rows with geometries to an empty table", async () => {
  const sdb = new SimpleDB();
  const table1 = sdb.newTable();

  const table2 = sdb.newTable();
  await table2.loadGeoData("test/geodata/files/point.json");
  await table2.latLon("geom", "lat", "lon");

  await table1.insertTables(table2, { unifyColumns: true });

  const types = await table1.getTypes();
  const projections = table1.projections;

  assertEquals({ types, projections }, {
    types: {
      geom: "GEOMETRY",
      lat: "DOUBLE",
      lon: "DOUBLE",
    },
    projections: { geom: "+proj=latlong +datum=WGS84 +no_defs" },
  });
  await sdb.done();
});
