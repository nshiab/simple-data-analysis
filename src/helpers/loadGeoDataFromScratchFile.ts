import { randomUUID } from "node:crypto";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { createDirectory } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

const temporaryDatavizDirectory = ".sda-cache/tmp/dataviz";

/**
 * Loads a GeoJSON string through a temporary file for DuckDB compatibility.
 *
 * @param table - The table into which the GeoJSON data is loaded.
 * @param geoData - The GeoJSON string to load.
 * @returns A promise that resolves when the data is loaded and the temporary file is removed.
 * @internal
 */
export default async function loadGeoDataFromScratchFile(
  table: SimpleTable,
  geoData: string,
): Promise<void> {
  const path = `${temporaryDatavizDirectory}/${randomUUID()}.geojson`;
  createDirectory(path);

  try {
    writeFileSync(path, geoData);
    table.loadGeoData(path);
    await table.run();
  } finally {
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
}
