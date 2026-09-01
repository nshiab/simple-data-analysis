import { DuckDBInstance } from "@duckdb/node-api";
import { requiredEnvironment } from "../environment.ts";
import {
  queryProfileEnvironment,
  type QueryTiming,
  recordQuery,
  writeQueryProfile,
} from "../queryProfile.ts";

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

const input = sqlString(requiredEnvironment("BENCHMARK_INPUT"));
const cleanOutput = sqlString(requiredEnvironment("BENCHMARK_CLEAN_OUTPUT"));
const resultOutput = sqlString(requiredEnvironment("BENCHMARK_RESULT_OUTPUT"));
const profileOutput = Deno.env.get(queryProfileEnvironment);
const profileStart = profileOutput === undefined ? 0 : performance.now();
const queries: QueryTiming[] = [];
const instance = await DuckDBInstance.create(":memory:");
const connection = await instance.connect();

try {
  const statements = [
    {
      label: "load and transform",
      query: `CREATE TABLE temperatures AS
    SELECT
      CAST(time AS DATE) AS time,
      station,
      station_name,
      CAST(tas AS DOUBLE) AS tas,
      CAST(FLOOR(YEAR(CAST(time AS DATE)) / 10) * 10 AS INTEGER) AS decade
    FROM read_csv(${input}, all_varchar = true)
    WHERE tas IS NOT NULL;`,
    },
    {
      label: "write clean output",
      query: `COPY temperatures TO ${cleanOutput} (HEADER, DELIMITER ',');`,
    },
    {
      label: "summarize and sort",
      query: `CREATE TABLE result AS
    SELECT station, station_name, decade, AVG(tas) AS mean
    FROM temperatures
    GROUP BY station, station_name, decade
    ORDER BY station, station_name, decade;`,
    },
    {
      label: "write result output",
      query: `COPY result TO ${resultOutput} (HEADER, DELIMITER ',');`,
    },
  ];
  if (profileOutput === undefined) {
    await connection.run(statements.map(({ query }) => query).join("\n"));
  } else {
    for (const statement of statements) {
      await recordQuery(
        queries,
        statement.label,
        statement.query,
        () => connection.run(statement.query),
      );
    }
  }
} finally {
  connection.closeSync();
  instance.closeSync();
  if (profileOutput !== undefined) {
    await writeQueryProfile(profileOutput, {
      totalMilliseconds: performance.now() - profileStart,
      queries,
    });
  }
}
