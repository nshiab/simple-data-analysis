import type { AsyncDuckDBConnection } from "npm:@duckdb/duckdb-wasm@1";
import type { DuckDBConnection } from "@duckdb/node-api";
import convertForJS from "./convertForJS.ts";

export default async function runQuery(
  query: string,
  connection: AsyncDuckDBConnection | DuckDBConnection,
  returnDataFromQuery: boolean,
  options: {
    debug: boolean;
    method: string | null;
    parameters: { [key: string]: unknown } | null;
    types?: { [key: string]: string };
  },
): Promise<
  | {
    [key: string]: number | string | Date | boolean | null;
  }[]
  | null
> {
  try {
    if (returnDataFromQuery) {
      const reader = await (connection as DuckDBConnection).runAndReadAll(
        query,
      );
      const rows = reader.getRowObjectsJson() as {
        [key: string]: string | number | boolean | Date | null;
      }[];

      if (options.types) {
        convertForJS(rows, options.types);
      }

      return rows;
    } else {
      await (connection as DuckDBConnection).run(query);
      return null;
    }
  } catch (error) {
    console.warn(error);
    if (options.debug === false) {
      console.log("SDA: method causing error =>", options.method);
      console.log("parameters:", options.parameters);
      console.log("query:", query);
    }
    throw error;
  }
}
