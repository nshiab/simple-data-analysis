import type { EmbeddingIdentity } from "@nshiab/journalism-ai";
import { quoteIdentifier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

const METADATA_TABLE = "__sda_embedding_column_metadata";
const METADATA_SCHEMA_VERSION = 1;

type EmbeddingColumnMetadata = {
  source_column: string;
  identity_json: string;
  dimensions: number;
  schema_version: number;
};

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

async function ensureMetadataTable(table: SimpleTable): Promise<void> {
  await table.sdb.customQuery(
    `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(METADATA_TABLE)} (
      table_name VARCHAR NOT NULL,
      embedding_column VARCHAR NOT NULL,
      source_column VARCHAR NOT NULL,
      identity_json VARCHAR NOT NULL,
      dimensions INTEGER NOT NULL,
      schema_version INTEGER NOT NULL,
      PRIMARY KEY (table_name, embedding_column)
    );`,
  );
}

async function readMetadata(
  table: SimpleTable,
  embeddingColumn: string,
): Promise<EmbeddingColumnMetadata | undefined> {
  const rows = await table.sdb.customQuery(
    `SELECT source_column, identity_json, dimensions, schema_version
    FROM ${quoteIdentifier(METADATA_TABLE)}
    WHERE table_name = ${quoteLiteral(table.name)}
      AND embedding_column = ${quoteLiteral(embeddingColumn)};`,
    { returnData: true },
  ) as EmbeddingColumnMetadata[];
  return rows[0];
}

async function deleteMetadata(
  table: SimpleTable,
  embeddingColumn: string,
): Promise<void> {
  await table.sdb.customQuery(
    `DELETE FROM ${quoteIdentifier(METADATA_TABLE)}
    WHERE table_name = ${quoteLiteral(table.name)}
      AND embedding_column = ${quoteLiteral(embeddingColumn)};`,
  );
}

async function getDimensions(
  table: SimpleTable,
  embeddingColumn: string,
): Promise<number> {
  const type = (await table.getTypes())[embeddingColumn];
  const fixedSize = type?.match(/\[(\d+)\]$/)?.[1];
  if (fixedSize !== undefined) {
    return Number(fixedSize);
  }
  const values = await table.getValues(embeddingColumn);
  const vector = values.find(Array.isArray);
  return vector?.length ?? 0;
}

async function dropManagedVssIndexes(table: SimpleTable): Promise<void> {
  const indexes = await table.sdb.customQuery(
    `SELECT index_name FROM duckdb_indexes()
    WHERE table_name = ${quoteLiteral(table.name)};`,
    { returnData: true },
  ) as { index_name: string }[];
  const managedIndexes = indexes.filter(({ index_name }) =>
    index_name.startsWith("vss_cosine_index_")
  );
  for (const { index_name } of managedIndexes) {
    await table.sdb.customQuery(
      `DROP INDEX IF EXISTS ${quoteIdentifier(index_name)};`,
    );
  }
  const dropped = new Set(managedIndexes.map(({ index_name }) => index_name));
  table.indexes = table.indexes.filter((index) => !dropped.has(index));
}

async function writeMetadata(
  table: SimpleTable,
  sourceColumn: string,
  embeddingColumn: string,
  identityJson: string,
  dimensions: number,
): Promise<void> {
  await table.sdb.customQuery(
    `INSERT OR REPLACE INTO ${quoteIdentifier(METADATA_TABLE)}
      (table_name, embedding_column, source_column, identity_json, dimensions, schema_version)
    VALUES (
      ${quoteLiteral(table.name)},
      ${quoteLiteral(embeddingColumn)},
      ${quoteLiteral(sourceColumn)},
      ${quoteLiteral(identityJson)},
      ${dimensions},
      ${METADATA_SCHEMA_VERSION}
    );`,
  );
}

/**
 * Ensures that an SDA-managed embedding column exists in the requested vector
 * space, regenerating legacy or incompatible vectors before recording their
 * provenance.
 *
 * @param table Table that owns the source and embedding columns.
 * @param sourceColumn Text column used to generate the vectors.
 * @param embeddingColumn SDA-managed vector column.
 * @param identity Canonical upstream embedding identity for the request.
 * @param generate Regenerates the managed column when reuse is unsafe.
 * @returns Whether the existing vectors were reused or regenerated.
 *
 * @example
 * ```ts
 * await ensureEmbeddingColumn(table, "text", "text_embeddings", identity, async () => {
 *   await generateEmbeddings();
 * });
 * ```
 *
 * @internal
 */
export default async function ensureEmbeddingColumn(
  table: SimpleTable,
  sourceColumn: string,
  embeddingColumn: string,
  identity: EmbeddingIdentity,
  generate: () => Promise<void>,
): Promise<"reused" | "generated"> {
  const identityJson = JSON.stringify(identity);
  await ensureMetadataTable(table);

  const columnExists = await table.hasColumn(embeddingColumn);
  const metadata = await readMetadata(table, embeddingColumn);
  if (columnExists && metadata !== undefined) {
    const dimensions = await getDimensions(table, embeddingColumn);
    if (
      metadata.schema_version === METADATA_SCHEMA_VERSION &&
      metadata.source_column === sourceColumn &&
      metadata.identity_json === identityJson &&
      metadata.dimensions === dimensions
    ) {
      return "reused";
    }
  }

  await deleteMetadata(table, embeddingColumn);
  if (columnExists) {
    await dropManagedVssIndexes(table);
  }

  await generate();
  if (!(await table.hasColumn(embeddingColumn))) {
    throw new Error(
      `Embedding generation did not create ${
        quoteIdentifier(embeddingColumn)
      } in table ${quoteIdentifier(table.name)}.`,
    );
  }
  const dimensions = await getDimensions(table, embeddingColumn);
  await writeMetadata(
    table,
    sourceColumn,
    embeddingColumn,
    identityJson,
    dimensions,
  );
  return "generated";
}
