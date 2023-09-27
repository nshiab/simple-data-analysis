import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection } from "duckdb"

export default async function queryDB(
    connection: AsyncDuckDBConnection | Connection,
    runQuery: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<unknown>,
    query: string,
    options: {
        table?: string
        verbose: boolean
        nbRowsToLog: number
        returnDataFrom: "query" | "table" | "none"
        returnedDataModifier?: (
            rows: {
                [key: string]: unknown
            }[]
        ) => unknown
        debug: boolean
        noTiming: boolean
        justQuery: boolean
    }
) {
    let start
    if ((options.verbose || options.debug) && !options.noTiming) {
        start = Date.now()
    }
    if (options.debug) {
        console.log(query)
    }

    let data = null

    if (
        options.returnDataFrom === "none" &&
        options.verbose === false &&
        options.debug === false
    ) {
        data = await runQuery(query, connection, false)
    } else if (options.returnDataFrom === "query") {
        data = await runQuery(query, connection, true)
    } else if (
        options.returnDataFrom === "table" ||
        (options.returnDataFrom === "none" &&
            (options.verbose || options.debug))
    ) {
        if (typeof options.table !== "string") {
            throw new Error("No options.table")
        }

        await runQuery(query, connection, false)
        if (options.nbRowsToLog === Infinity) {
            data = await runQuery(
                `SELECT * FROM ${options.table};`,
                connection,
                true
            )
        } else {
            data = await runQuery(
                `SELECT * FROM ${options.table} LIMIT ${options.nbRowsToLog};`,
                connection,
                true
            )
        }
    } else {
        throw new Error(
            "No condition handling the returned data in this.query!"
        )
    }

    if (options.returnedDataModifier) {
        if (data === null) {
            throw new Error(
                "Data is null. Use option returnDataFrom with 'query' or 'table'."
            )
        }
        data = options.returnedDataModifier(
            data as unknown as {
                [key: string]: unknown
            }[]
        ) as {
            [key: string]: unknown
        }[]
    }

    if ((options.verbose || options.debug) && !options.justQuery) {
        if (data === null) {
            throw new Error(
                "Data is null. Use option returnDataFrom with 'query' or 'table'."
            )
        }
        if (Array.isArray(data)) {
            console.table(data)
            const nbRows = (
                (await runQuery(
                    `SELECT COUNT(*) FROM ${options.table};`,
                    connection,
                    true
                )) as unknown as { "count_star()": number }[]
            )[0]["count_star()"]
            console.log(
                `${nbRows} rows in total ${
                    options.returnDataFrom === "none"
                        ? ""
                        : `(nbRowsToLog: ${options.nbRowsToLog})`
                }`
            )
        } else {
            console.log(data)
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }
    }

    return data
}
