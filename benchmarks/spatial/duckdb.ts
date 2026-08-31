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

const treesInput = sqlString(requiredEnvironment("BENCHMARK_INPUT"));
const neighbourhoodsInput = sqlString(
  requiredEnvironment("BENCHMARK_POLYGONS"),
);
const resultOutput = sqlString(requiredEnvironment("BENCHMARK_RESULT_OUTPUT"));
const profileOutput = Deno.env.get(queryProfileEnvironment);
const profileStart = profileOutput === undefined ? 0 : performance.now();
const queries: QueryTiming[] = [];
const instance = await DuckDBInstance.create(":memory:");
const connection = await instance.connect();

try {
  const statements = [
    {
      label: "load spatial extension",
      query: `INSTALL spatial;
    LOAD spatial;
    SET geometry_always_xy = true;`,
    },
    {
      label: "load and transform trees",
      query: `CREATE TABLE trees AS
    SELECT
      ST_Point(
        CAST(Longitude AS DOUBLE),
        CAST(Latitude AS DOUBLE)
      )::GEOMETRY('EPSG:4326') AS geom
    FROM read_csv(${treesInput}, all_varchar = true, ignore_errors = true)
    WHERE Longitude IS NOT NULL AND Latitude IS NOT NULL;`,
    },
    {
      label: "load neighbourhoods",
      query: `CREATE TABLE neighbourhoods AS
    SELECT nom_qr, geom
    FROM ST_Read(${neighbourhoodsInput});`,
    },
    {
      label: "join, summarize, and sort",
      query: `CREATE TABLE result AS
    SELECT neighbourhoods.nom_qr, CAST(COUNT(*) AS INTEGER) AS count
    FROM trees
    INNER JOIN neighbourhoods
      ON ST_Covers(neighbourhoods.geom, trees.geom)
    GROUP BY neighbourhoods.nom_qr
    ORDER BY neighbourhoods.nom_qr;`,
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
