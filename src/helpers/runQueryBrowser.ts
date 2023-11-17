import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection } from "duckdb"
import tableToArrayOfObjects from "./arraysToData.js"

export default async function runQueryBrowser(
    query: string,
    connection: AsyncDuckDBConnection | Connection,
    returnDataFromQuery: boolean
): Promise<
    | {
          [key: string]: number | string | Date | boolean | null
      }[]
    | null
> {
    if (returnDataFromQuery) {
        const data = await (connection as AsyncDuckDBConnection).query(query)
        return tableToArrayOfObjects(data)
    } else {
        await (connection as AsyncDuckDBConnection).query(query)
        return null
    }
}
