import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection } from "duckdb"
import tableToArrayOfObjects from "./arraysToData.js"
import { Table } from "apache-arrow"

export default async function runQueryBrowser(
    query: string,
    connection: AsyncDuckDBConnection | Connection,
    returnDataFromQuery: boolean,
    options: {
        debug: boolean
        method: string | null
        parameters: { [key: string]: unknown } | null
        bigIntToInt?: boolean
    }
): Promise<
    | {
          [key: string]: number | string | Date | boolean | null
      }[]
    | null
> {
    try {
        if (returnDataFromQuery) {
            const data = await (connection as AsyncDuckDBConnection).query(
                query
            )
            // Weird
            return tableToArrayOfObjects(data as unknown as Table)
        } else {
            await (connection as AsyncDuckDBConnection).query(query)
            return null
        }
    } catch (err) {
        if (options.debug === false) {
            console.log("SDA: method causing error =>", options.method)
            console.log("parameters:", options.parameters)
            console.log("query:", query)
        }
        throw err
    }
}
