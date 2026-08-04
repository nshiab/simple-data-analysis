import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { assert, assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { geo, plot } from "@observablehq/plot";
const output = "./test/output/";
const datavizTempDirectory = ".sda-cache/tmp/dataviz";
if (!existsSync(output)) {
  mkdirSync(output);
}

function getDatavizTempFiles(): Set<string> {
  return new Set(
    existsSync(datavizTempDirectory) ? readdirSync(datavizTempDirectory) : [],
  );
}

Deno.test("should write a map as png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      title: "A map",
      subtitle: "A subtitle",
      caption: "A caption",
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

  await table.writeMap(map, path);

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should write a dark map as png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: {
    features: unknown[];
  }) =>
    plot({
      title: "A map",
      subtitle: "A subtitle",
      caption: "A caption",
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map-dark.png";

  await table.writeMap(map, path, { dark: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should write a map as svg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  table.loadGeoData(
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

  await table.writeMap(map, path);

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map in a folder that doesn't exist", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  table.loadGeoData(
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

  await table.writeMap(map, path);

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map with multiple layers as a png", async () => {
  // From the README example
  const sdb = new SimpleDB();
  const provinces = sdb.newTable("provinces");

  provinces.loadGeoData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const fires = sdb.newTable("fires");
  fires.loadData(
    "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/firesCanada2023.csv",
  );
  fires.points("lat", "lon", "geom");
  fires.replace("cause", {
    "H": "Human",
    "N": "Natural",
    "U": "Unknown",
  });
  fires.selectColumns(["geom", "hectares", "cause"]);
  fires.filter(`hectares > 0 AND cause != 'Unknown'`);

  const provincesAndFires = provinces.cloneTable({
    name: "provincesAndFires",
  });
  provincesAndFires.addColumn("hectares", "number", `0`);
  provincesAndFires.addColumn("cause", "string", `''`);

  provincesAndFires.insertTables(fires, { unifyColumns: true });
  provincesAndFires.addColumn("isFire", "boolean", `hectares > 0`);

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

  await provincesAndFires.writeMap(map, path);

  await sdb.done();

  // How to assert?
  assertEquals(true, true);
});

Deno.test(
  "should pass dates and the selected geometry through a temporary GeoJSON file",
  async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    table.loadArray([{
      day: "2026-08-04",
      moment: "2026-08-04T12:34:56.000Z",
      latA: 45,
      lonA: -73,
      latB: 46,
      lonB: -74,
    }]);
    table.convert({ day: "date", moment: "timestamp" });
    table.points("latA", "lonA", "geometryA");
    table.points("latB", "lonB", "geometryB");

    const filesBefore = getDatavizTempFiles();
    let tempPath: string | undefined;

    await table.writeMap(
      (data) => {
        const tempFile = [...getDatavizTempFiles()].find((file) =>
          !filesBefore.has(file) && file.endsWith(".geojson")
        );
        assert(tempFile !== undefined);
        tempPath = `${datavizTempDirectory}/${tempFile}`;

        const feature = data.features[0] as {
          geometry: { coordinates: number[]; type: string };
          properties: Record<string, unknown>;
        };
        assert(feature.properties.day instanceof Date);
        assert(feature.properties.moment instanceof Date);
        assertEquals(feature.geometry, {
          type: "Point",
          coordinates: [-74, 46],
        });

        return plot({ marks: [geo(data)] });
      },
      output + "dates-and-selected-geometry.png",
      {
        column: "geometryB",
      },
    );

    assert(tempPath !== undefined);
    assertEquals(existsSync(tempPath), false);
    await sdb.done();
  },
);

Deno.test(
  "should remove temporary map data after an error",
  async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    table.loadArray([{
      latA: 45,
      lonA: -73,
      latB: 46,
      lonB: -74,
    }]);
    table.points("latA", "lonA", "geometryA");
    table.points("latB", "lonB", "geometryB");

    const tableNamesBefore = (await sdb.getTableNames()).sort();
    const filesBefore = getDatavizTempFiles();
    let tempPath: string | undefined;
    const consoleError = console.error;
    try {
      console.error = () => {};
      await table.writeMap(
        () => {
          const tempFile = [...getDatavizTempFiles()].find((file) =>
            !filesBefore.has(file) && file.endsWith(".geojson")
          );
          assert(tempFile !== undefined);
          tempPath = `${datavizTempDirectory}/${tempFile}`;
          throw new Error("Expected map error");
        },
        output + "expected-map-error.png",
        { column: "geometryB" },
      );
    } finally {
      console.error = consoleError;
    }

    assert(tempPath !== undefined);
    assertEquals(existsSync(tempPath), false);
    assertEquals((await sdb.getTableNames()).sort(), tableNamesBefore);
    await sdb.done();
  },
);

Deno.test("should rewind polygon coordinates before creating a map", async () => {
  const inputPath = output + "polygon-to-rewind.geojson";
  writeFileSync(
    inputPath,
    JSON.stringify({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ]],
        },
      }],
    }),
  );

  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable();
    table.loadGeoData(inputPath);

    await table.writeMap((data) => {
      const feature = data.features[0] as unknown as {
        geometry: { coordinates: number[][][] };
      };
      assertEquals(feature.geometry.coordinates[0], [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ]);
      return plot({ marks: [geo(data)] });
    }, output + "rewound-polygon.png");
  } finally {
    await sdb.done();
    if (existsSync(inputPath)) {
      unlinkSync(inputPath);
    }
  }
});
