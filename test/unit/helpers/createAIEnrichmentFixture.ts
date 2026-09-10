import { assertEquals } from "@std/assert";
import type SimpleTable from "../../../src/class/SimpleTable.ts";
import { quoteIdentifier } from "@nshiab/simple-data-analysis-core/helpers";
import SimpleDB from "../../../src/class/SimpleDB.ts";

/** Builds SQL-native values and compares them in DuckDB without JS conversion. */
export default async function createAIEnrichmentFixture(rowCount = 1003) {
  const sdb = new SimpleDB();
  const table = sdb.newTable("enriched");
  // Typed ingestion initializes the spatial extension before SQL-native fixtures.
  await table.loadArray([{ geometry: null }], {
    columnTypes: { geometry: "GEOMETRY('EPSG:4326')" },
  }).run();
  await sdb.customQuery(`CREATE OR REPLACE TABLE enriched AS SELECT
    i, 'row-' || i AS text, 7 AS rowid,
    9007199254740993::BIGINT AS exact,
    DATE '2025-01-01' AS date,
    1234567890123456.789::DECIMAL(19,3) AS amount,
    TIMESTAMP_NS '2025-01-01 12:34:56.123456789' AS instant,
    {'ids': [9007199254740993::BIGINT], 'values': [NULL, 1.234::DECIMAL(7,3)]} AS nested,
    [1, 2]::FLOAT[2] AS existing_vector,
    CASE WHEN i % 2 = 0 THEN
      ST_Point(2.123456789012345, 48.987654321098765)
      ELSE NULL END::GEOMETRY('EPSG:4326') AS geometry,
    ST_Point(1234567.8901234567, 7654321.098765432)::GEOMETRY('EPSG:3857') AS projected,
    ST_Point(1.123456789012345, 2.987654321098765) AS unknown_crs,
    NULL::GEOMETRY('EPSG:4326') AS null_geometry
    FROM range(${rowCount}) t(i)`);
  await sdb.customQuery("CREATE TABLE expected AS SELECT * FROM enriched");
  const originalTypes = await table.getTypes();
  return {
    sdb,
    table,
    assertGeometry: async (result: SimpleTable = table) => {
      const types = await result.getTypes();
      const geometryColumns = Object.keys(originalTypes).filter((name) =>
        originalTypes[name].startsWith("GEOMETRY")
      );
      for (const name of geometryColumns) {
        assertEquals(types[name], originalTypes[name]);
      }
      const projection = [
        "i",
        ...geometryColumns.map((name) =>
          `ST_AsWKB(${quoteIdentifier(name)}) AS ${quoteIdentifier(name)}`
        ),
      ].join(", ");
      assertEquals(
        await sdb.customQuery(
          `SELECT count(*) AS differences FROM (
          (SELECT ${projection} FROM ${quoteIdentifier(result.name)})
          EXCEPT ALL (SELECT ${projection} FROM expected)
        )`,
          { returnData: true },
        ),
        [{ differences: 0 }],
      );
    },
    assertPreserved: async (outputs: string[] = []) => {
      const types = await table.getTypes();
      assertEquals(
        Object.fromEntries(
          Object.entries(types).filter(([name]) => !outputs.includes(name)),
        ),
        originalTypes,
      );
      const projection = Object.keys(originalTypes).map((name) =>
        originalTypes[name].startsWith("GEOMETRY")
          ? `ST_AsWKB("${name}") AS "${name}"`
          : `"${name}"`
      )
        .join(", ");
      assertEquals(
        await sdb.customQuery(
          `SELECT count(*) AS differences FROM (
        ((SELECT ${projection} FROM enriched) EXCEPT ALL (SELECT ${projection} FROM expected))
        UNION ALL
        ((SELECT ${projection} FROM expected) EXCEPT ALL (SELECT ${projection} FROM enriched))
      )`,
          { returnData: true },
        ),
        [{ differences: 0 }],
      );
      assertEquals(
        (await sdb.getTableNames()).filter((name) =>
          name.startsWith("__sda_") &&
          name !== "__sda_embedding_column_metadata"
        ),
        [],
      );
    },
  };
}
