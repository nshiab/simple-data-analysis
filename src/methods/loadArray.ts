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
  const dataForChunk: DuckDBValue[][] = [];
  for (const key of keys) {
    const type = typeof arrayOfObjects[0][key];
    if (
      type === "symbol" || type === "undefined" ||
      type === "function"
    ) {
      throw new Error(`Type ${type} not supported.`);
    } else if (type === "object") {
      if (arrayOfObjects[0][key] instanceof Date) {
        types.push("TIMESTAMP");
        dataForChunk.push(arrayOfObjects.map((d) => {
          if (d[key] === null || d[key] === undefined || Number.isNaN(d[key])) {
            return null;
          } else {
            const date = d[key] as Date;
            return new DuckDBTimestampValue(BigInt(date.getTime() * 1000));
          }
        }));
      } else {
        throw new Error(`Type object not supported.`);
      }
    } else {
      types.push(parseType(type));
      dataForChunk.push(arrayOfObjects.map((d) => {
        if (d[key] === undefined || Number.isNaN(d[key])) {
          return null;
        } else {
          return d[key] as DuckDBValue;
        }
      }));
    }
  }

  await simpleTable.sdb.customQuery(
    `CREATE OR REPLACE TABLE ${simpleTable.name}(${
      keys.map((key, i) => `"${key}" ${types[i]}`).join(", ")
    })`,
  );

  const appender = await (simpleTable.connection as DuckDBConnection)
    .createAppender("main", simpleTable.name);

  const chunk = DuckDBDataChunk.create(types.map((d) => parseDuckDBType(d)));

  chunk.setColumns(
    dataForChunk,
  );
  appender.appendDataChunk(chunk);
  appender.flush();
}
