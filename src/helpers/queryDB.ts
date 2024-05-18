import SimpleWebDB from "../class/SimpleWebDB.js"
import addThousandSeparator from "./addThousandSeparator.js"
import formatDuration from "./formatDuration.js"
import logData from "./logData.js"

export default async function queryDB(
    SimpleWebDB: SimpleWebDB,
    query: string,
    options: {
        table: string | null
        method: string | null
        parameters: { [key: string]: unknown } | null
        nbRowsToLog: number
        returnDataFrom: "query" | "none"
        debug: boolean
        bigIntToInt: boolean
    }
): Promise<
    | {
          [key: string]: string | number | boolean | Date | null
      }[]
    | null
> {
    if (SimpleWebDB.connection === undefined) {
        await SimpleWebDB.start()
    }

    query = query
        .replace(/ && /g, " AND ")
        .replace(/ & /g, " AND ")
        .replace(/ \|\| /g, " OR ")
        .replace(/ \| /g, " OR ")
        .replace(/ === /g, " = ")
        .replace(/ == /g, " = ")

    let start
    if (options.debug) {
        console.log("\n" + options.method)
        console.log("parameters:", options.parameters)
        console.log(query)
        start = Date.now()
    }

    let data = null

    if (options.debug) {
        const queryResult = await SimpleWebDB.runQuery(
            query,
            SimpleWebDB.connection,
            true,
            options
        )
        console.log("\nquery result:")
        if (
            Array.isArray(queryResult) &&
            queryResult.length > options.nbRowsToLog
        ) {
            logData(queryResult.slice(0, options.nbRowsToLog))
            console.log(`nbRowsToLog: ${options.nbRowsToLog}`)
        } else {
            logData(queryResult)
        }

        if (options.returnDataFrom === "query") {
            data = queryResult
        } else if (options.returnDataFrom === "none") {
            // Nothing
        } else {
            throw new Error(
                `Unknown ${options.returnDataFrom} options.returnDataFrom`
            )
        }
    } else if (options.returnDataFrom === "none") {
        await SimpleWebDB.runQuery(
            query,
            SimpleWebDB.connection,
            false,
            options
        )
    } else if (options.returnDataFrom === "query") {
        data = await SimpleWebDB.runQuery(
            query,
            SimpleWebDB.connection,
            true,
            options
        )
    } else {
        throw new Error(
            `Unknown ${options.returnDataFrom} options.returnDataFrom`
        )
    }

    if (options.debug) {
        if (typeof options.table === "string") {
            console.log(`\ntable ${options.table}:`)
            const tableToLog = await SimpleWebDB.runQuery(
                `SELECT * FROM ${options.table} LIMIT ${options.nbRowsToLog}`,
                SimpleWebDB.connection,
                true,
                options
            )
            logData(tableToLog)
            const nbRows = await SimpleWebDB.runQuery(
                `SELECT COUNT(*) FROM ${options.table};`,
                SimpleWebDB.connection,
                true,
                options
            )
            if (nbRows === null) {
                throw new Error("nbRows is null")
            }
            console.log(
                `${addThousandSeparator(
                    nbRows[0]["count_star()"] as number
                )} rows in total ${
                    options.returnDataFrom === "none"
                        ? ""
                        : `(nbRowsToLog: ${options.nbRowsToLog})`
                }`
            )
        } else {
            console.log("\nNo options.table. Not logging table.")
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${formatDuration(start, end)}`)
        }
    }

    if (options.returnDataFrom === "query") {
        if (data === null) {
            throw new Error("data is null")
        }
        return data
    } else {
        return null
    }
}
