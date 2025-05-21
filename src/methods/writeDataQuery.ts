import { existsSync, rmSync } from "node:fs";
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
  } else if (fileExtension === "db") {
    if (existsSync(file)) {
      rmSync(file);
    }
    return `ATTACH '${file}' AS my_database;
COPY FROM DATABASE memory TO my_database;
CREATE OR REPLACE TABLE my_database."${table}" AS SELECT * FROM "${table}";
DETACH my_database;`;
  } else if (fileExtension === "sqlite") {
    if (existsSync(file)) {
      rmSync(file);
    }
    return `INSTALL sqlite; LOAD sqlite;
    ATTACH '${file}' AS my_sqlite_db (TYPE SQLITE);
    CREATE TABLE my_sqlite_db."${table}" AS SELECT * FROM "${table}";
    DETACH my_sqlite_db;`;
  } else {
    throw new Error(`Unknown extension ${fileExtension}`);
  }
}
