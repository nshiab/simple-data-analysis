import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection } from "duckdb"

export default async function queryDB(
    connection: AsyncDuckDBConnection | Connection,
    runQuery: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<
        { [key: string]: number | string | Date | boolean | null }[] | undefined
    >,
    query: string,
    options: {
        table: string | null
        nbRowsToLog: number
        returnDataFrom: "query" | "table" | "none"
        returnedDataModifier?: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[]
        debug: boolean
    }
): Promise<
    | {
          [key: string]: string | number | boolean | Date | null
      }[]
    | null
    | undefined
> {
    let start
    if (options.debug) {
        start = Date.now()
    }
    if (options.debug) {
        console.log(options)
        console.log(query)
    }

    let data = null

    if (options.debug) {
        const queryResult = await runQuery(query, connection, true)
        console.log("\nquery result:")
        console.table(queryResult)

        if (options.returnDataFrom === "query") {
            data = queryResult
        } else if (options.returnDataFrom === "table") {
            if (typeof options.table !== "string") {
                throw new Error("No options.table")
            }
            data = await runQuery(
                `SELECT * FROM ${options.table};`,
                connection,
                true
            )
        } else if (options.returnDataFrom === "none") {
            // Nothing
        } else {
            throw new Error(
                `Unknown ${options.returnDataFrom} options.returnDataFrom`
            )
        }
    } else if (options.returnDataFrom === "none") {
        await runQuery(query, connection, false)
    } else if (options.returnDataFrom === "query") {
        data = await runQuery(query, connection, true)
    } else if (options.returnDataFrom === "table") {
        if (typeof options.table !== "string") {
            throw new Error("No options.table")
        }
        await runQuery(query, connection, false)
        data = await runQuery(
            `SELECT * FROM ${options.table};`,
            connection,
            true
        )
    } else {
        throw new Error(
            `Unknown ${options.returnDataFrom} options.returnDataFrom`
        )
    }

    if (options.returnedDataModifier) {
        if (data === null || data === undefined) {
            throw new Error(
                "Data is null. Use option returnedDataModifier with 'query' or 'table'."
            )
        }
        data = options.returnedDataModifier(data)
    }

    if (options.debug) {
        if (Array.isArray(data)) {
            if (options.returnDataFrom === "query") {
                console.log(`${data.length} rows in total`)
            } else if (typeof options.table === "string") {
                console.log(`\ntable ${options.table}:`)
                console.table(data)
                const nbRows = await runQuery(
                    `SELECT COUNT(*) FROM ${options.table};`,
                    connection,
                    true
                )
                if (nbRows === undefined) {
                    throw new Error("nbRows is undefined")
                }
                console.log(
                    `${nbRows[0]["count_star()"]} rows in total ${
                        options.returnDataFrom === "none"
                            ? ""
                            : `(nbRowsToLog: ${options.nbRowsToLog})`
                    }`
                )
            }
        } else {
            console.log("data:", data)
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }
    }

    if (
        options.returnDataFrom === "table" ||
        options.returnDataFrom === "query"
    ) {
        return data
    } else {
        return null
    }
}
