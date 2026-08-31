import type SimpleDB from "../../src/class/SimpleDB.ts";

export default async function runSpatialSdaPipeline(
  sdb: SimpleDB,
  paths: {
    treesInput: string;
    neighbourhoodsInput: string;
    resultOutput: string;
  },
): Promise<void> {
  const trees = sdb.newTable("trees");
  trees
    .loadData(paths.treesInput, {
      allText: true,
      columns: ["Latitude", "Longitude"],
      ignoreErrors: true,
    })
    .removeMissing({
      columns: ["Latitude", "Longitude"],
      missingValues: [],
    })
    .addColumn(
      "geom",
      "geometry('EPSG:4326')",
      `ST_Point(CAST("Longitude" AS DOUBLE), CAST("Latitude" AS DOUBLE))`,
    )
    .selectColumns("geom");

  const neighbourhoods = sdb.newTable("neighbourhoods");
  neighbourhoods.loadGeoData(paths.neighbourhoodsInput, {
    columns: ["nom_qr", "geom"],
  });

  const joined = trees.joinGeo(neighbourhoods, "inside", {
    type: "inner",
    outputTable: "joined",
    excludeLeftGeometry: true,
    excludeRightGeometry: true,
  });
  joined
    .summarize({ by: "nom_qr", stats: "count" })
    .sort({ nom_qr: "asc" });
  await joined.writeData(paths.resultOutput);
}
