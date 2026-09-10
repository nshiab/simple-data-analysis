import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

/** Builds SQL-native values and compares them in DuckDB without JS conversion. */
export default async function createAIEnrichmentFixture() {
  const sdb = new SimpleDB();
  const table = sdb.newTable("enriched");
  await sdb.customQuery(`CREATE TABLE enriched AS SELECT
    i, 'row-' || i AS text, 7 AS rowid,
    9007199254740993::BIGINT AS exact,
    DATE '2025-01-01' AS date,
    1234567890123456.789::DECIMAL(19,3) AS amount,
    TIMESTAMP_NS '2025-01-01 12:34:56.123456789' AS instant,
    {'ids': [9007199254740993::BIGINT], 'values': [NULL, 1.234::DECIMAL(7,3)]} AS nested,
    [1, 2]::FLOAT[2] AS existing_vector
    FROM range(1003) t(i)`);
  await sdb.customQuery("CREATE TABLE expected AS SELECT * FROM enriched");
  const originalTypes = await table.getTypes();
  return {
    sdb,
    table,
    assertPreserved: async (outputs: string[] = []) => {
      const types = await table.getTypes();
      assertEquals(
        Object.fromEntries(
          Object.entries(types).filter(([name]) => !outputs.includes(name)),
        ),
        originalTypes,
      );
      const projection = Object.keys(originalTypes).map((name) => `"${name}"`)
        .join(", ");
      assertEquals(
        await sdb.customQuery(
          `SELECT count(*) AS differences FROM (
        ((SELECT ${projection} FROM enriched) EXCEPT ALL (SELECT * FROM expected))
        UNION ALL
        ((SELECT * FROM expected) EXCEPT ALL (SELECT ${projection} FROM enriched))
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
