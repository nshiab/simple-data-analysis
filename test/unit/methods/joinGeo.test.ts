import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

const sdb = new SimpleDB();

Deno.test("should do a left spatial join the intersect method", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect");
  await prov.selectColumns(["nameEnglish", "name"]);

  const data = await prov.getData();
  assertEquals(data, [
    { nameEnglish: "Quebec", name: "polygonA" },
    { nameEnglish: "Ontario", name: "polygonA" },
    { nameEnglish: "Manitoba", name: "polygonB" },
    { nameEnglish: "Saskatchewan", name: "polygonB" },
    { nameEnglish: "Alberta", name: "polygonB" },
    { nameEnglish: "British Columbia", name: "polygonB" },
    { nameEnglish: "Northwest Territories", name: "polygonB" },
    { nameEnglish: "Nunavut", name: "polygonB" },
    { nameEnglish: "Newfoundland and Labrador", name: null },
    { nameEnglish: "Prince Edward Island", name: null },
    { nameEnglish: "Nova Scotia", name: null },
    { nameEnglish: "New Brunswick", name: null },
    { nameEnglish: "Yukon", name: null },
  ]);
});
Deno.test("should do a left spatial join the intersect method and keep all projections", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect");

  assertEquals(prov.projections, {
    geom: "+proj=latlong +datum=WGS84 +no_defs",
    geom_1: "+proj=latlong +datum=WGS84 +no_defs",
  });
});
Deno.test("should do a left spatial join the intersect method and output the results to a new table", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  const table = await prov.joinGeo(poly, "intersect", {
    outputTable: true,
  });
  await table.selectColumns(["nameEnglish", "name"]);

  const data = await table.getData();
  assertEquals(data, [
    { nameEnglish: "Quebec", name: "polygonA" },
    { nameEnglish: "Ontario", name: "polygonA" },
    { nameEnglish: "Manitoba", name: "polygonB" },
    { nameEnglish: "Saskatchewan", name: "polygonB" },
    { nameEnglish: "Alberta", name: "polygonB" },
    { nameEnglish: "British Columbia", name: "polygonB" },
    { nameEnglish: "Northwest Territories", name: "polygonB" },
    { nameEnglish: "Nunavut", name: "polygonB" },
    { nameEnglish: "Newfoundland and Labrador", name: null },
    { nameEnglish: "Prince Edward Island", name: null },
    { nameEnglish: "Nova Scotia", name: null },
    { nameEnglish: "New Brunswick", name: null },
    { nameEnglish: "Yukon", name: null },
  ]);
});
Deno.test("should do a left spatial join the intersect method and output the results to a new table with a specific name", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect", {
    outputTable: "specificTable",
  });

  const data = await sdb.customQuery(
    "select nameEnglish, name from specificTable",
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    { nameEnglish: "Quebec", name: "polygonA" },
    { nameEnglish: "Ontario", name: "polygonA" },
    { nameEnglish: "Manitoba", name: "polygonB" },
    { nameEnglish: "Saskatchewan", name: "polygonB" },
    { nameEnglish: "Alberta", name: "polygonB" },
    { nameEnglish: "British Columbia", name: "polygonB" },
    { nameEnglish: "Northwest Territories", name: "polygonB" },
    { nameEnglish: "Nunavut", name: "polygonB" },
    { nameEnglish: "Newfoundland and Labrador", name: null },
    { nameEnglish: "Prince Edward Island", name: null },
    { nameEnglish: "Nova Scotia", name: null },
    { nameEnglish: "New Brunswick", name: null },
    { nameEnglish: "Yukon", name: null },
  ]);
});
Deno.test("should do a left spatial join the intersect method with tables with default names", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect");

  const columnsLeftTable = await prov.getColumns();

  assertEquals(columnsLeftTable, [
    "nameEnglish",
    "nameFrench",
    "geom",
    "name",
    "geom_1",
  ]);
});
Deno.test("should do a left spatial join the intersect method with tables with specific names", async () => {
  const prov = sdb.newTable("prov");
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable("poly");
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect");

  const columnsLeftTable = await prov.getColumns();

  assertEquals(columnsLeftTable, [
    "nameEnglish",
    "nameFrench",
    "geom",
    "name",
    "geomPoly",
  ]);
});
Deno.test("should do a left spatial join the intersect method without changing the name of the original tables", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect");

  const columnsLeftTable = await prov.getColumns();
  const columnsRightTable = await poly.getColumns();

  assertEquals(
    { columnsLeftTable, columnsRightTable },
    {
      columnsLeftTable: [
        "nameEnglish",
        "nameFrench",
        "geom",
        "name",
        "geom_1",
      ],
      columnsRightTable: ["name", "geom"],
    },
  );
});
Deno.test("should do a left spatial join the intersect method without changing the name of the original tables with an outputTable option", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");

  await prov.joinGeo(poly, "intersect", { outputTable: true });

  const columnsLeftTable = await prov.getColumns();
  const columnsRightTable = await poly.getColumns();

  assertEquals(
    { columnsLeftTable, columnsRightTable },
    {
      columnsLeftTable: ["nameEnglish", "nameFrench", "geom"],
      columnsRightTable: ["name", "geom"],
    },
  );
});
Deno.test("should do a left spatial join the intersect method with specific options", async () => {
  const prov = sdb.newTable();
  await prov.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await prov.renameColumns({ geom: "geomProvince" });
  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygons.geojson");
  await poly.renameColumns({ geom: "geomPolygon" });

  const joined = await prov.joinGeo(poly, "intersect", {
    leftTableColumn: "geomProvince",
    rightTableColumn: "geomPolygon",
    type: "inner",
    outputTable: "joined",
  });
  await joined.selectColumns(["nameEnglish", "name"]);

  const data = await joined.getData();

  assertEquals(data, [
    { nameEnglish: "Quebec", name: "polygonA" },
    { nameEnglish: "Ontario", name: "polygonA" },
    { nameEnglish: "Manitoba", name: "polygonB" },
    { nameEnglish: "Saskatchewan", name: "polygonB" },
    { nameEnglish: "Alberta", name: "polygonB" },
    { nameEnglish: "British Columbia", name: "polygonB" },
    { nameEnglish: "Northwest Territories", name: "polygonB" },
    { nameEnglish: "Nunavut", name: "polygonB" },
  ]);
});
Deno.test("should do a left spatial join the inside method", async () => {
  const points = sdb.newTable();
  await points.loadGeoData("test/geodata/files/pointsInside.json");

  const poly = sdb.newTable();
  await poly.loadGeoData("test/geodata/files/polygonInside.json");
  await poly.renameColumns({ name: "polygonName" });

  await points.joinGeo(poly, "inside");
  await points.selectColumns(["name", "polygonName"]);

  const data = await points.getData();

  assertEquals(data, [
    { name: "pointC", polygonName: "container" },
    { name: "pointD", polygonName: "container" },
    { name: "pointA", polygonName: null },
    { name: "pointB", polygonName: null },
  ]);
});
Deno.test("should return all intersections and all rows from leftTable when doing a left join", async () => {
  const polygonsWithin = sdb.newTable();
  await polygonsWithin.loadGeoData(
    "test/geodata/files/polygonsWithinPolygons.json",
  );

  const polygonsWithinNotNull = await polygonsWithin.cloneTable({
    condition: `name NOT NULL`,
  });
  await polygonsWithinNotNull.removeColumns("container");

  const containers = await polygonsWithin.cloneTable({
    condition: `container NOT NULL`,
  });
  await containers.removeColumns("name");

  const joined = await polygonsWithinNotNull.joinGeo(
    containers,
    "intersect",
    {
      outputTable: "joined",
    },
  );
  await joined.selectColumns(["name", "container"]);
  await joined.sort({ name: "asc" });
  const data = await joined.getData();

  assertEquals(data, [
    { name: "A", container: null },
    { name: "B", container: "A" },
    { name: "B", container: "B" },
    { name: "C", container: "A" },
    { name: "C", container: "B" },
    { name: "D", container: "A" },
  ]);
});
Deno.test("should return all intersections - and just intersections - when doing an inner join", async () => {
  const polygonsWithin = sdb.newTable();
  await polygonsWithin.loadGeoData(
    "test/geodata/files/polygonsWithinPolygons.json",
  );

  const polygonsWithinNotNull = await polygonsWithin.cloneTable({
    condition: `name NOT NULL`,
  });
  await polygonsWithinNotNull.removeColumns("container");

  const containers = await polygonsWithin.cloneTable({
    condition: `container NOT NULL`,
  });
  await containers.removeColumns("name");

  const joined = await polygonsWithinNotNull.joinGeo(
    containers,
    "intersect",
    {
      outputTable: "joined",
      type: "inner",
    },
  );
  await joined.selectColumns(["name", "container"]);
  await joined.sort({ name: "asc" });
  const data = await joined.getData();

  assertEquals(data, [
    { name: "B", container: "A" },
    { name: "B", container: "B" },
    { name: "C", container: "A" },
    { name: "C", container: "B" },
    { name: "D", container: "A" },
  ]);
});
Deno.test("should return all points within a target distance (srs method)", async () => {
  const cities = sdb.newTable();
  await cities.loadGeoData("test/geodata/files/coordinates.geojson");
  const cloned = await cities.cloneTable();
  await cloned.renameColumns({ name: "name_1" });
  await cities.joinGeo(cloned, "within", { distance: 10 });
  await cities.distance("geom", "geomTable1", "dist", { decimals: 2 });
  await cities.selectColumns(["name", "name_1", "dist"]);

  const data = await cities.getData();

  assertEquals(data, [
    { name: "toronto", name_1: "toronto", dist: 0 },
    { name: "montreal", name_1: "toronto", dist: 5.66 },
    { name: "toronto", name_1: "montreal", dist: 5.66 },
    { name: "montreal", name_1: "montreal", dist: 0 },
    { name: "vancouver", name_1: "vancouver", dist: 0 },
  ]);
});
Deno.test("should return all points within a target distance (haversine method)", async () => {
  const cities = sdb.newTable();
  await cities.loadGeoData("test/geodata/files/coordinates.geojson");
  const cloned = await cities.cloneTable();
  await cloned.renameColumns({ name: "name_1" });

  await cities.joinGeo(cloned, "within", {
    distance: 500_000,
    distanceMethod: "haversine",
    type: "inner",
  });
  await cities.distance("geom", "geomTable1", "dist", {
    method: "haversine",
    decimals: 0,
  });
  await cities.selectColumns(["name", "name_1", "dist"]);
  const data = await cities.getData();

  assertEquals(data, [
    { name: "toronto", name_1: "toronto", dist: 0 },
    { name: "toronto", name_1: "montreal", dist: 464577 },
    { name: "montreal", name_1: "toronto", dist: 464577 },
    { name: "montreal", name_1: "montreal", dist: 0 },
    { name: "vancouver", name_1: "vancouver", dist: 0 },
  ]);
});
Deno.test("should return all points within a target distance (spheroid method)", async () => {
  const cities = sdb.newTable();
  await cities.loadGeoData("test/geodata/files/coordinates.geojson");
  const cloned = await cities.cloneTable();
  await cloned.renameColumns({ name: "name_1" });

  await cities.joinGeo(cloned, "within", {
    distance: 500_000,
    distanceMethod: "spheroid",
    type: "inner",
  });
  await cities.distance("geom", "geomTable1", "dist", {
    method: "spheroid",
    decimals: 0,
  });
  await cities.selectColumns(["name", "name_1", "dist"]);

  const data = await cities.getData();

  assertEquals(data, [
    { name: "toronto", name_1: "toronto", dist: 0 },
    { name: "toronto", name_1: "montreal", dist: 465639 },
    { name: "montreal", name_1: "toronto", dist: 465639 },
    { name: "montreal", name_1: "montreal", dist: 0 },
    { name: "vancouver", name_1: "vancouver", dist: 0 },
  ]);
});

await sdb.done();
