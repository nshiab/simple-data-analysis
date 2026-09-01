import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { observeSdaQueries } from "../../../benchmarks/queryProfile.ts";
import runTabularSdaPipeline from "../../../benchmarks/tabular/sdaPipeline.ts";
import runSpatialSdaPipeline from "../../../benchmarks/spatial/sdaPipeline.ts";

Deno.test("tabular benchmark keeps its typed source in one fused load", async () => {
  const directory = await Deno.makeTempDir();
  const input = `${directory}/temperatures.csv`;
  await Deno.writeTextFile(
    input,
    `time,station,station_name,tas
2001-01-01,1,Alpha,2.5
2002-01-01,1,Alpha,3.5
2011-01-01,2,Beta,4.5
2012-01-01,2,Beta,
`,
  );
  const sdb = new SimpleDB();
  const observer = observeSdaQueries(sdb);
  try {
    await runTabularSdaPipeline(sdb, {
      input,
      cleanOutput: `${directory}/clean.csv`,
      resultOutput: `${directory}/result.csv`,
    });

    const sourceDescriptions = observer.queries.filter((entry) =>
      entry.query.startsWith("DESCRIBE WITH") &&
      entry.query.includes("read_csv_auto")
    );
    assertEquals(sourceDescriptions.length, 0);

    const materializations = observer.queries.filter((entry) =>
      entry.query.includes('CREATE OR REPLACE TABLE "temperatures"')
    );
    assertEquals(materializations.length, 2);
    assertStringIncludes(materializations[0].query, "read_csv_auto");
    assertStringIncludes(materializations[0].query, '"s4"');
    assertStringIncludes(materializations[1].query, "AVG(");
  } finally {
    observer.restore();
    await sdb.close();
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("spatial benchmark fuses its tree scan and loads spatial once", async () => {
  const directory = await Deno.makeTempDir();
  const treesInput = `${directory}/trees.csv`;
  const neighbourhoodsInput = `${directory}/neighbourhoods.geojson`;
  await Deno.writeTextFile(
    treesInput,
    `Latitude,Longitude
45.50,-73.60
45.51,-73.61
46.00,-74.00
`,
  );
  await Deno.writeTextFile(
    neighbourhoodsInput,
    JSON.stringify({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { nom_qr: "Centre" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-73.7, 45.4],
            [-73.5, 45.4],
            [-73.5, 45.6],
            [-73.7, 45.6],
            [-73.7, 45.4],
          ]],
        },
      }],
    }),
  );
  const sdb = new SimpleDB();
  const observer = observeSdaQueries(sdb);
  try {
    await runSpatialSdaPipeline(sdb, {
      treesInput,
      neighbourhoodsInput,
      resultOutput: `${directory}/result.csv`,
    });

    const treeMaterializations = observer.queries.filter((entry) =>
      entry.query.includes('CREATE OR REPLACE TABLE "trees"')
    );
    assertEquals(treeMaterializations.length, 1);
    assertStringIncludes(treeMaterializations[0].query, "read_csv_auto");
    assertStringIncludes(treeMaterializations[0].query, "ST_Point");

    const spatialLoads = observer.queries.filter((entry) =>
      entry.query.includes("INSTALL spatial")
    );
    assertEquals(spatialLoads.length, 1);

    const joinedMaterializations = observer.queries.filter((entry) =>
      entry.query.includes('CREATE OR REPLACE TABLE "joined"')
    );
    assertEquals(joinedMaterializations.length, 2);
    assert(joinedMaterializations[0].query.includes("ST_Covers"));
    assert(joinedMaterializations[1].query.includes("COUNT(*)"));
  } finally {
    observer.restore();
    await sdb.close();
    await Deno.remove(directory, { recursive: true });
  }
});
