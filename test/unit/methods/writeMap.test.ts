import { existsSync, mkdirSync } from "node:fs";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { geo, plot } from "@observablehq/plot";
const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

Deno.test("should write a map as png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.png";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map as jpeg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.jpeg";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map as svg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.svg";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map in a folder that doesn't exist", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "test/test/map.png";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map with multiple layers as a png", async () => {
  // From the README example
  const sdb = new SimpleDB();
  const provinces = sdb.newTable("provinces");

  await provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const fires = sdb.newTable("fires");
  await fires.loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  );
  await fires.points("lat", "lon", "geom");
  await fires.replace("cause", {
    "H": "Human",
    "N": "Natural",
    "U": "Unknown",
  });
  await fires.selectColumns(["geom", "hectares", "cause"]);
  await fires.filter(`hectares > 0 AND cause != 'Unknown'`);

  const provincesAndFires = await provinces.cloneTable({
    outputTable: "provincesAndFires",
  });
  await provincesAndFires.addColumn("hectares", "number", `0`);
  await provincesAndFires.addColumn("cause", "string", `''`);
  await provincesAndFires.insertTables(fires);
  await provincesAndFires.addColumn("isFire", "boolean", `hectares > 0`);

  const map = (
    geoData: {
      features: {
        properties: { [key: string]: unknown };
      }[];
    },
  ) => {
    const fires = geoData.features.filter((d) => d.properties.isFire);
    const provinces = geoData.features.filter((d) => !d.properties.isFire);

    return plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: geoData,
      },
      color: {
        legend: true,
      },
      r: { range: [0.5, 25] },
      marks: [
        geo(provinces, {
          stroke: "lightgray",
          fill: "whitesmoke",
        }),
        geo(fires, {
          r: "hectares",
          fill: "cause",
          fillOpacity: 0.25,
          stroke: "cause",
          strokeOpacity: 0.5,
        }),
      ],
    });
  };

  const path = output + "test/test/complex-map.png";

  await provincesAndFires.writeMap(map, path, { rewind: true });

  await sdb.done();

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
