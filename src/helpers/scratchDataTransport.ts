import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createDirectory } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

type TableData = Record<string, unknown>[];

type GeoData = {
  features: {
    properties: Record<string, unknown>;
  }[];
};

const temporaryDatavizDirectory = ".sda-cache/tmp/dataviz";

function convertDateStringsToDatesInPlace(
  rows: TableData,
  types: Record<string, string>,
): void {
  for (const [column, type] of Object.entries(types)) {
    if (type !== "DATE" && type !== "TIMESTAMP") {
      continue;
    }

    for (const row of rows) {
      if (typeof row[column] === "string") {
        row[column] = new Date(row[column]);
      }
    }
  }
}

async function withTemporaryDatavizFile<Result>(
  extension: "geojson" | "json",
  useFile: (path: string) => Result | Promise<Result>,
): Promise<Result> {
  // Temporary workaround for Deno/DuckDB result-chunk finalization crashes.
  const path = `${temporaryDatavizDirectory}/${randomUUID()}.${extension}`;
  createDirectory(path);
  let result: Result;

  try {
    result = await useFile(path);
  } catch (error) {
    try {
      if (existsSync(path)) {
        unlinkSync(path);
      }
    } catch (cleanupError) {
      console.error(cleanupError);
    }
    throw error;
  }

  if (existsSync(path)) {
    unlinkSync(path);
  }
  return result;
}

async function removeTemporaryTable(
  table: SimpleTable | undefined,
): Promise<void> {
  if (table !== undefined) {
    await table.removeTable();
  }
}

async function withTemporaryTable<Result>(
  table: SimpleTable,
  useTable: (table: SimpleTable) => Result | Promise<Result>,
): Promise<Result> {
  let result: Result;
  try {
    result = await useTable(table);
  } catch (error) {
    try {
      await removeTemporaryTable(table);
    } catch (cleanupError) {
      console.error(cleanupError);
    }
    throw error;
  }

  await removeTemporaryTable(table);
  return result;
}

export async function withDataFromScratchFile<Result>(
  table: SimpleTable,
  options: {
    columns?: string[];
  },
  useData: (data: TableData) => Result | Promise<Result>,
): Promise<Result> {
  const types = await table.getTypes();

  const readData = async (tableToWrite: SimpleTable): Promise<Result> =>
    await withTemporaryDatavizFile("json", async (path) => {
      await tableToWrite.writeData(path, { formatDates: true });
      const data = JSON.parse(readFileSync(path, "utf8")) as TableData;
      convertDateStringsToDatesInPlace(data, types);
      return await useData(data);
    });

  if (options.columns === undefined) {
    return await readData(table);
  }

  return await withTemporaryTable(
    table.cloneTable({ columns: options.columns }),
    readData,
  );
}

export async function withGeoDataFromScratchFile<Result>(
  table: SimpleTable,
  options: {
    column?: string;
    rewind?: boolean;
  },
  useGeoData: (geoData: GeoData) => Result | Promise<Result>,
): Promise<Result> {
  const types = await table.getTypes();
  const geometryColumns = Object.entries(types)
    .filter(([, type]) => type.toLowerCase().includes("geometry"))
    .map(([column]) => column);
  let temporaryTable: SimpleTable | undefined;

  if (options.column !== undefined) {
    if (!types[options.column]?.toLowerCase().includes("geometry")) {
      throw new Error(`Column "${options.column}" is not a geometry column.`);
    }
    temporaryTable = table.cloneTable({
      columns: Object.entries(types)
        .filter(([column, type]) =>
          column === options.column ||
          !type.toLowerCase().includes("geometry")
        )
        .map(([column]) => column),
    });
  } else if (geometryColumns.length > 1) {
    throw new Error(
      "More than one column storing geometries. Specify one with options.column.",
    );
  }

  const readGeoData = async (tableToWrite: SimpleTable): Promise<Result> =>
    await withTemporaryDatavizFile("geojson", async (path) => {
      await tableToWrite.writeGeoData(path, {
        formatDates: true,
        rewind: options.rewind,
      });
      const geoData = JSON.parse(readFileSync(path, "utf8")) as GeoData;
      convertDateStringsToDatesInPlace(
        geoData.features.map((feature) => feature.properties),
        types,
      );
      return await useGeoData(geoData);
    });

  if (temporaryTable === undefined) {
    return await readGeoData(table);
  }

  return await withTemporaryTable(temporaryTable, readGeoData);
}

export async function loadGeoDataFromScratchFile(
  table: SimpleTable,
  geoData: string,
): Promise<void> {
  await withTemporaryDatavizFile("geojson", async (path) => {
    writeFileSync(path, geoData);
    table.loadGeoData(path);
    await table.run();
  });
}
