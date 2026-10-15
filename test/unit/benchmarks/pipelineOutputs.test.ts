import { test, expect } from "vite-plus/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

import SimpleDB from "../../../src/class/SimpleDB.ts";
import { parseCSV } from "../../../benchmarks/helpers.ts";
import runTabularSdaPipeline from "../../../benchmarks/tabular/sdaPipeline.ts";
import runSpatialSdaPipeline from "../../../benchmarks/spatial/sdaPipeline.ts";

test("tabular benchmark writes cleaned rows and sorted decade means", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const input = `${directory}/temperatures.csv`;
  await writeFile(
    input,
    `time,station,station_name,tas
2011-01-01,2,Beta,4.5
2001-01-01,1,Alpha,2.5
2002-01-01,1,Alpha,3.5
2012-01-01,2,Beta,
`,
  );
  const sdb = new SimpleDB();
  try {
    await runTabularSdaPipeline(sdb, {
      input,
      cleanOutput: `${directory}/clean.csv`,
      resultOutput: `${directory}/result.csv`,
    });

    expect(parseCSV(await readFile(`${directory}/clean.csv`, "utf8"))).toEqual([
      ["time", "station", "station_name", "tas", "decade"],
      ["2011-01-01", "2", "Beta", "4.5", "2010"],
      ["2001-01-01", "1", "Alpha", "2.5", "2000"],
      ["2002-01-01", "1", "Alpha", "3.5", "2000"],
    ]);
    expect(parseCSV(await readFile(`${directory}/result.csv`, "utf8"))).toEqual([
      ["station", "station_name", "decade", "mean"],
      ["1", "Alpha", "2000", "3.0"],
      ["2", "Beta", "2010", "4.5"],
    ]);
  } finally {
    await sdb.close();
    await rm(directory, { recursive: true });
  }
});

test("spatial benchmark writes neighbourhood tree counts", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const treesInput = `${directory}/trees.csv`;
  const neighbourhoodsInput = `${directory}/neighbourhoods.geojson`;
  await writeFile(
    treesInput,
    `Latitude,Longitude
45.50,-73.60
45.51,-73.61
46.00,-74.00
`,
  );
  await writeFile(
    neighbourhoodsInput,
    JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { nom_qr: "Centre" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-73.7, 45.4],
                [-73.5, 45.4],
                [-73.5, 45.6],
                [-73.7, 45.6],
                [-73.7, 45.4],
              ],
            ],
          },
        },
      ],
    }),
  );
  const sdb = new SimpleDB();
  try {
    await runSpatialSdaPipeline(sdb, {
      treesInput,
      neighbourhoodsInput,
      resultOutput: `${directory}/result.csv`,
    });

    expect(parseCSV(await readFile(`${directory}/result.csv`, "utf8"))).toEqual([
      ["nom_qr", "count"],
      ["Centre", "2"],
    ]);
  } finally {
    await sdb.close();
    await rm(directory, { recursive: true });
  }
});
