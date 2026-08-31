import { DuckDBInstance } from "@duckdb/node-api";

const expectedColumns = ["time", "station", "station_name", "tas", "decade"];

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

async function columnNames(
  connection: import("@duckdb/node-api").DuckDBConnection,
  path: string,
): Promise<string[]> {
  const result = await connection.run(
    `DESCRIBE SELECT * FROM read_csv(${
      sqlString(path)
    }, header = true, all_varchar = true)`,
  );
  return (await result.getRowsJS()).map((row) => String(row[0]));
}

function canonicalSelect(path: string): string {
  return `SELECT
    CAST("time" AS DATE) AS "time",
    CAST("station" AS VARCHAR) AS "station",
    CAST("station_name" AS VARCHAR) AS "station_name",
    CAST("tas" AS DOUBLE) AS "tas",
    CAST("decade" AS INTEGER) AS "decade",
    ROW_NUMBER() OVER () AS "__row"
  FROM read_csv(${sqlString(path)}, header = true, all_varchar = true)`;
}

/**
 * Validates the large cleaned tabular outputs outside the timed processes.
 * Values are parsed into the workload's canonical types, so harmless CSV
 * formatting differences such as `12` versus `12.0` compare as equal.
 */
export default async function assertEquivalentCleanOutputs(
  expectedPath: string,
  actualPath: string,
  implementation: string,
): Promise<void> {
  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();
  try {
    await connection.run("SET threads = 1;");
    for (
      const [label, path] of [
        ["raw DuckDB", expectedPath],
        [implementation, actualPath],
      ] as const
    ) {
      const columns = await columnNames(connection, path);
      if (columns.join("\0") !== expectedColumns.join("\0")) {
        throw new Error(
          `${label} cleaned output columns must be ${
            expectedColumns.join(",")
          }. Received ${columns.join(",")}.`,
        );
      }
    }

    const result = await connection.run(`
      WITH expected AS (${canonicalSelect(expectedPath)}),
           actual AS (${canonicalSelect(actualPath)})
      SELECT
        COUNT(expected."__row") AS expected_rows,
        COUNT(actual."__row") AS actual_rows,
        COUNT_IF(
          expected."__row" IS NULL OR actual."__row" IS NULL OR
          expected."time" IS DISTINCT FROM actual."time" OR
          expected."station" IS DISTINCT FROM actual."station" OR
          expected."station_name" IS DISTINCT FROM actual."station_name" OR
          expected."tas" IS DISTINCT FROM actual."tas" OR
          expected."decade" IS DISTINCT FROM actual."decade"
        ) AS mismatched_rows
      FROM expected
      FULL OUTER JOIN actual USING ("__row")
    `);
    const [[expectedRows, actualRows, mismatchedRows]] = await result
      .getRowsJS();
    if (mismatchedRows !== 0n) {
      throw new Error(
        `${implementation} cleaned output has ${actualRows} rows and ${mismatchedRows} row mismatches; raw DuckDB has ${expectedRows} rows.`,
      );
    }
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}
