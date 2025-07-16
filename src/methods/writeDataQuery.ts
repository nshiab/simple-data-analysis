import { existsSync, rmSync } from "node:fs";
import cleanPath from "../helpers/cleanPath.ts";

export default function writeDataQuery(
  table: string,
  file: string,
  fileExtension: string,
  options: { compression?: boolean; formatDates?: boolean },
) {
  const cleanedFile = cleanPath(file);
  if (fileExtension === "csv") {
    return `COPY "${table}" TO '${
      options.compression ? cleanedFile + ".gz" : cleanedFile
    }' (DELIMITER ',', HEADER TRUE${
      options.compression ? ", COMPRESSION GZIP" : ""
    }${
      options.formatDates
        ? ", DATEFORMAT '%xT%X.%gZ', TIMESTAMPFORMAT '%xT%X.%gZ'"
        : ""
    });`;
  } else if (fileExtension === "json") {
    return `COPY "${table}" TO '${
      options.compression ? cleanedFile + ".gz" : cleanedFile
    }' (FORMAT JSON, ARRAY TRUE${
      options.compression ? ", COMPRESSION GZIP" : ""
    }${
      options.formatDates
        ? ", DATEFORMAT '%xT%X.%gZ', TIMESTAMPFORMAT '%xT%X.%gZ'"
        : ""
    });`;
  } else if (fileExtension === "parquet") {
    if (options.compression) {
      return `COPY "${table}" TO '${cleanedFile}' (FORMAT PARQUET, COMPRESSION ZSTD);`;
    } else {
      return `COPY "${table}" TO '${cleanedFile}' (FORMAT PARQUET);`;
    }
  } else if (fileExtension === "db") {
    if (existsSync(file)) {
      rmSync(file);
    }
    return `ATTACH '${cleanedFile}' AS "my_database";
COPY FROM DATABASE memory TO "my_database";
CREATE OR REPLACE TABLE "my_database"."${table}" AS SELECT * FROM "${table}";
DETACH "my_database";`;
  } else if (fileExtension === "sqlite") {
    if (existsSync(file)) {
      rmSync(file);
    }
    return `INSTALL sqlite; LOAD sqlite;
    ATTACH '${cleanedFile}' AS "my_sqlite_db" (TYPE SQLITE);
    CREATE TABLE "my_sqlite_db"."${table}" AS SELECT * FROM "${table}";
    DETACH "my_sqlite_db";`;
  } else {
    throw new Error(`Unknown extension ${fileExtension}`);
  }
}
