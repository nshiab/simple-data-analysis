import { formatNumber, prettyDuration } from "journalism"
import { SimpleWebDB, SimpleWebTable } from "../bundle.js"
import logData from "./logData.js"

export default async function queryDB(
    simple: SimpleWebTable | SimpleWebDB,
    query: string,
    options: {
        table: string | null
        method: string | null
        parameters: { [key: string]: unknown } | null
        nbRowsToLog: number
        nbCharactersToLog: number | undefined
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
    if (simple instanceof SimpleWebDB && simple.connection === undefined) {
        await simple.start()
    } else if (
        simple instanceof SimpleWebTable &&
        simple.connection === undefined
    ) {
        await simple.sdb.start()
        simple.db = simple.sdb.db
        simple.connection = simple.sdb.connection
    }
    if (simple.connection === undefined) {
        throw new Error("simple.connection is undefined")
    }

    query = query
        .replace(/ && /g, " AND ")
        .replace(/ & /g, " AND ")
        .replace(/ \|\| /g, " OR ")
        .replace(/ \| /g, " OR ")
        .replace(/ === /g, " = ")
        .replace(/ == /g, " = ")
        .replace(/ !== /g, " != ")

    let start
    if (options.debug) {
        console.log("\n" + options.method)
        console.log("parameters:", options.parameters)
        console.log(query)
        start = Date.now()
    }

    let data = null

    if (options.debug) {
        const queryResult = await simple.runQuery(
            query,
            simple.connection,
            true,
            options
        )
        console.log("\nquery result:")
        if (
            Array.isArray(queryResult) &&
            queryResult.length > options.nbRowsToLog
        ) {
            logData(
                {},
                queryResult.slice(0, options.nbRowsToLog),
                options.nbCharactersToLog
            )
            console.log(`nbRowsToLog: ${options.nbRowsToLog}`)
        } else {
            logData({}, queryResult, options.nbCharactersToLog)
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
        await simple.runQuery(query, simple.connection, false, options)
    } else if (options.returnDataFrom === "query") {
        data = await simple.runQuery(query, simple.connection, true, options)
    } else {
        throw new Error(
            `Unknown ${options.returnDataFrom} options.returnDataFrom`
        )
    }

    if (options.debug) {
        if (typeof options.table === "string") {
            console.log(`\ntable ${options.table}:`)
            const tableToLog = await simple.runQuery(
                `SELECT * FROM ${options.table}${options.nbRowsToLog === Infinity ? "" : ` LIMIT ${options.nbRowsToLog}`}`,
                simple.connection,
                true,
                options
            )
            logData({}, tableToLog, options.nbCharactersToLog)
            const nbRows = await simple.runQuery(
                `SELECT COUNT(*) FROM ${options.table};`,
                simple.connection,
                true,
                options
            )
            if (nbRows === null) {
                throw new Error("nbRows is null")
            }
            console.log(
                `${formatNumber(
                    nbRows[0]["count_star()"] as number
                )} rows in total ${
                    options.returnDataFrom === "none"
                        ? ""
                        : `(nbRowsToLog: ${options.nbRowsToLog}${typeof options.nbCharactersToLog === "number" ? `, nbCharactersToLog: ${options.nbCharactersToLog}` : ""})`
                }`
            )
        } else {
            console.log("\nNo options.table. Not logging table.")
        }

        if (start) {
            console.log(`Done in ${prettyDuration(start)}`)
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
