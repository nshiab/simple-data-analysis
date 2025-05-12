import {
  type DuckDBConnection,
  DuckDBDataChunk,
  DuckDBTimestampValue,
  type DuckDBValue,
} from "@duckdb/node-api";
import type SimpleTable from "../class/SimpleTable.ts";
import parseType from "../helpers/parseTypes.ts";
import parseDuckDBType from "../helpers/parseDuckDBType.ts";

export default async function loadArray(
  simpleTable: SimpleTable,
  arrayOfObjects: { [key: string]: unknown }[],
) {
  if (simpleTable.connection === undefined) {
    await simpleTable.sdb.start();
    simpleTable.connection = simpleTable.sdb.connection;
  }

  const keys = Object.keys(arrayOfObjects[0]);
  const types: string[] = [];
  const dataForChunk: DuckDBValue[][] = arrayOfObjects.map(() => []);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const type = typeof arrayOfObjects[0][key];
    if (
      type === "symbol" || type === "undefined" ||
      type === "function"
    ) {
      throw new Error(`Type ${type} not supported.`);
    } else if (type === "object") {
      if (arrayOfObjects[0][key] instanceof Date) {
        types[i] = "TIMESTAMP";

        for (let j = 0; j < arrayOfObjects.length; j++) {
          const d = arrayOfObjects[j][key];
          if (d === null || d === undefined || Number.isNaN(d)) {
            dataForChunk[j][i] = null;
          } else {
            const date = d as Date;
            dataForChunk[j][i] = new DuckDBTimestampValue(
              BigInt(date.getTime() * 1000),
            );
          }
        }
      } else {
        throw new Error(`Type object not supported.`);
      }
    } else {
      types[i] = parseType(type);

      for (let j = 0; j < arrayOfObjects.length; j++) {
        const d = arrayOfObjects[j][key];
        if (d === null || d === undefined || Number.isNaN(d)) {
          dataForChunk[j][i] = null;
        } else {
          dataForChunk[j][i] = d as DuckDBValue;
        }
      }
    }
  }

  await simpleTable.sdb.customQuery(
    `CREATE OR REPLACE TABLE ${simpleTable.name}(${
      keys.map((key, i) => `"${key}" ${types[i]}`).join(", ")
    })`,
  );

  const appender = await (simpleTable.connection as DuckDBConnection)
    .createAppender(simpleTable.name);

  // The maximum capacity of a DuckDB data chunk is 2048 rows.
  const chunkSize = 2000;
  for (let i = 0; i < dataForChunk.length; i += chunkSize) {
    const chunk = dataForChunk.slice(i, i + chunkSize);
    const dataChunk = DuckDBDataChunk.create(
      types.map((d) => parseDuckDBType(d)),
      chunk.length,
    );
    dataChunk.setRows(
      chunk,
    );
    appender.appendDataChunk(dataChunk);
  }

  appender.flushSync();
}
