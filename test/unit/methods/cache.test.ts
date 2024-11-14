import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

if (existsSync("./.sda-cache")) {
  rmSync("./.sda-cache", { recursive: true });
}

Deno.test("should log a warning, not an error, when no data or table", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(async () => {
    // Nothing in cache
  });
  await sdb.done();
  assertEquals(true, true);
});
Deno.test("should log a warning, not an error, when loading cache when no data or table", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(async () => {
    // Nothing in cache
  });
  await sdb.done();
  assertEquals(true, true);
});
Deno.test("should cache computed values for tabular data", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(async () => {
    await table.loadData("test/data/files/dataSummarize.json");
    await table.summarize({
      values: "key2",
      decimals: 4,
    });
  });
  const data = await table.getData();
  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should load data from the cache instead of running computations", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(async () => {
    await table.loadData("test/data/files/dataSummarize.json");
    await table.summarize({
      values: "key2",
      decimals: 4,
    });
  });
  const data = await table.getData();
  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should load data from the cache if ttl has not expired", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(
    async () => {
      await table.loadData("test/data/files/dataSummarize.json");
      await table.summarize({
        values: "key2",
        decimals: 4,
      });
    },
    { ttl: 10 },
  );
  const data = await table.getData();
  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should not load data from the cache if ttl has expired", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(
    async () => {
      await table.loadData("test/data/files/dataSummarize.json");
      await table.summarize({
        values: "key2",
        decimals: 4,
      });
    },
    { ttl: 0 },
  );
  const data = await table.getData();
  assertEquals(data, [
    {
      value: "key2",
      count: 6,
      countUnique: 4,
      countNull: 2,
      min: 1,
      max: 22,
      mean: 9,
      median: 6.5,
      sum: 36,
      skew: 0.9669,
      stdDev: 9.7639,
      var: 95.3333,
    },
  ]);
  await sdb.done();
});
Deno.test("should cache computed values for geospatial data", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const tableGeo = sdb.newTable("geodata");
  await tableGeo.cache(async () => {
    await tableGeo.loadGeoData("test/geodata/files/pointsInside.json");
    await tableGeo.renameColumns({ geom: "points" });
    await tableGeo.latLon("points", "lat", "lon");
  });

  await tableGeo.removeColumns("points");
  const data = await tableGeo.getData();

  assertEquals(data, [
    {
      name: "pointA",
      lat: 48.241182892559266,
      lon: -76.34553248992202,
    },
    {
      name: "pointB",
      lat: 50.15023361660323,
      lon: -73.18043031919933,
    },
    {
      name: "pointC",
      lat: 48.47150751404138,
      lon: -72.78960434234926,
    },
    {
      name: "pointD",
      lat: 47.43075362784262,
      lon: -72.2926406368759,
    },
  ]);
  await sdb.done();
});
Deno.test("should load geospatial data from the cache instead of running computations", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const tableGeo = sdb.newTable("geodata");

  await tableGeo.cache(async () => {
    await tableGeo.loadGeoData("test/geodata/files/pointsInside.json");
    await tableGeo.renameColumns({ geom: "points" });
    await tableGeo.latLon("points", "lat", "lon");
  });

  await tableGeo.removeColumns("points");
  const data = await tableGeo.getData();

  assertEquals(data, [
    {
      name: "pointA",
      lat: 48.241182892559266,
      lon: -76.34553248992202,
    },
    {
      name: "pointB",
      lat: 50.15023361660323,
      lon: -73.18043031919933,
    },
    {
      name: "pointC",
      lat: 48.47150751404138,
      lon: -72.78960434234926,
    },
    {
      name: "pointD",
      lat: 47.43075362784262,
      lon: -72.2926406368759,
    },
  ]);
  await sdb.done();
});
Deno.test("should not load data from the cache if ttl has expired", async () => {
  const sdb = new SimpleDB({ cacheVerbose: true });
  const tableGeo = sdb.newTable("geodata");
  await tableGeo.cache(
    async () => {
      await tableGeo.loadGeoData(
        "test/geodata/files/pointsInside.json",
      );
      await tableGeo.renameColumns({ geom: "points" });
      await tableGeo.latLon("points", "lat", "lon");
    },
    { ttl: 0 },
  );

  await tableGeo.removeColumns("points");
  const data = await tableGeo.getData();

  assertEquals(data, [
    {
      name: "pointA",
      lat: 48.241182892559266,
      lon: -76.34553248992202,
    },
    {
      name: "pointB",
      lat: 50.15023361660323,
      lon: -73.18043031919933,
    },
    {
      name: "pointC",
      lat: 48.47150751404138,
      lon: -72.78960434234926,
    },
    {
      name: "pointD",
      lat: 47.43075362784262,
      lon: -72.2926406368759,
    },
  ]);
  await sdb.done();
});
Deno.test("should clean the cache when calling done", async () => {
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  const sdb = new SimpleDB({ cacheVerbose: true });
  const table = sdb.newTable();
  await table.cache(async () => {
    await table.loadData("test/data/files/dataSummarize.json");
    await table.summarize({
      values: "key2",
      decimals: 4,
    });
  });

  // We create a fake cached file.

  const cacheSources = JSON.parse(
    readFileSync(".sda-cache/sources.json", "utf-8"),
  );
  cacheSources["testForCache"] = {
    timestamp: 1720117189389,
    file: "./.sda-cache/testForCache.json",
    geo: false,
    geoColumnName: null,
  };
  writeFileSync(".sda-cache/sources.json", JSON.stringify(cacheSources));
  writeFileSync(".sda-cache/testForCache.json", JSON.stringify("Hi!"));

  await sdb.done();

  const cacheSourcesIdsUpdated = Object.keys(
    JSON.parse(readFileSync(".sda-cache/sources.json", "utf-8")),
  );
  const files = readdirSync(".sda-cache/").sort((a, b) => a > b ? 1 : -1);

  assertEquals(
    { cacheSourcesIdsUpdated, files },
    {
      cacheSourcesIdsUpdated: [
        "table1.ba119b25f1a06cb34dc4b98b9f63af6777498ad0430df7fb558587e23262356c",
      ],
      files: [
        "sources.json",
        "table1.ba119b25f1a06cb34dc4b98b9f63af6777498ad0430df7fb558587e23262356c.parquet",
      ],
    },
  );
});
