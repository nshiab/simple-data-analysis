import SimpleDB from "../indexWeb"
import addThousandSeparator from "./addThousandSeparator.js"

export default async function queryDB(
    simpleDB: SimpleDB,
    query: string,
    options: {
        table: string | null
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
    if (simpleDB.connection === undefined) {
        await simpleDB.start()
    }

    let start
    if (options.debug) {
        start = Date.now()
    }
    if (options.debug) {
        console.log(query)
    }

    let data = null

    if (options.debug) {
        const queryResult = await simpleDB.runQuery(
            query,
            simpleDB.connection,
            true,
            options
        )
        console.log("\nquery result:")
        console.table(queryResult)

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
        await simpleDB.runQuery(query, simpleDB.connection, false, options)
    } else if (options.returnDataFrom === "query") {
        data = await simpleDB.runQuery(
            query,
            simpleDB.connection,
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
            const tableToLog = await simpleDB.runQuery(
                `SELECT * FROM ${options.table} LIMIT ${options.nbRowsToLog}`,
                simpleDB.connection,
                true,
                options
            )
            console.table(tableToLog)
            const nbRows = await simpleDB.runQuery(
                `SELECT COUNT(*) FROM ${options.table};`,
                simpleDB.connection,
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
            console.log(`Done in ${end - start} ms`)
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
