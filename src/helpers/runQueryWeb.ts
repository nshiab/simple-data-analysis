import type { AsyncDuckDBConnection } from "npm:@duckdb/duckdb-wasm@1";
import type { Connection } from "npm:duckdb@1";
import tableToArrayOfObjects from "./arraysToData.ts";
import type { Table } from "npm:apache-arrow@17";

export default async function runQueryWeb(
  query: string,
  connection: AsyncDuckDBConnection | Connection,
  returnDataFromQuery: boolean,
  options: {
    debug: boolean;
    method: string | null;
    parameters: { [key: string]: unknown } | null;
    bigIntToInt?: boolean;
  },
): Promise<
  | {
    [key: string]: number | string | Date | boolean | null;
  }[]
  | null
> {
  try {
    if (returnDataFromQuery) {
      const data = await (connection as AsyncDuckDBConnection).query(query);
      // Weird
      return tableToArrayOfObjects(data as unknown as Table);
    } else {
      await (connection as AsyncDuckDBConnection).query(query);
      return null;
    }
  } catch (err) {
    if (options.debug === false) {
      console.log("SDA: method causing error =>", options.method);
      console.log("parameters:", options.parameters);
      console.log("query:", query);
    }
    throw err;
  }
}
