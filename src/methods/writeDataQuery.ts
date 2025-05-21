import getExtension from "../helpers/getExtension.ts";

export default function writeDataQuery(
  table: string,
  file: string,
  options: { compression?: boolean },
) {
  const fileExtension = getExtension(file);
  if (fileExtension === "csv") {
    if (options.compression) {
      return `COPY "${table}" TO '${
        file + ".gz"
      }' (DELIMITER ',', HEADER TRUE, COMPRESSION GZIP);`;
    } else {
      return `COPY "${table}" TO '${file}' (DELIMITER ',', HEADER TRUE);`;
    }
  } else if (fileExtension === "json") {
    if (options.compression) {
      return `COPY "${table}" TO '${
        file + ".gz"
      }' (FORMAT JSON, ARRAY TRUE, COMPRESSION GZIP);`;
    } else {
      return `COPY "${table}" TO '${file}' (FORMAT JSON, ARRAY TRUE);`;
    }
  } else if (fileExtension === "parquet") {
    if (options.compression) {
      return `COPY "${table}" TO '${file}' (FORMAT PARQUET, COMPRESSION ZSTD);`;
    } else {
      return `COPY "${table}" TO '${file}' (FORMAT PARQUET);`;
    }
  } else if (fileExtension === "sqlite") {
    return `INSTALL sqlite; LOAD sqlite;
    ATTACH '${file}' AS ${table}_sqlite_db (TYPE SQLITE);
    CREATE TABLE IF NOT EXISTS ${table}_sqlite_db."${table}" AS SELECT * FROM "${table}";`;
  } else {
    throw new Error(`Unknown extension ${fileExtension}`);
  }
}
