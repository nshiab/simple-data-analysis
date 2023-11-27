import { SimpleDB } from "../indexWeb"
import addThousandSeparator from "./addThousandSeparator.js"

export default async function queryDB(
    simpleDB: SimpleDB,
    query: string,
    options: {
        table: string | null
        nbRowsToLog: number
        returnDataFrom: "query" | "table" | "none"
        debug: boolean
        returnedDataModifier:
            | ((
                  rows: {
                      [key: string]: number | string | Date | boolean | null
                  }[]
              ) => {
                  [key: string]: number | string | Date | boolean | null
              }[])
            | null
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
        console.log(options)
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
        } else if (options.returnDataFrom === "table") {
            if (typeof options.table !== "string") {
                throw new Error("No options.table")
            }
            data = await simpleDB.runQuery(
                `SELECT * FROM ${options.table};`,
                simpleDB.connection,
                true,
                options
            )
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
    } else if (options.returnDataFrom === "table") {
        if (typeof options.table !== "string") {
            throw new Error("No options.table")
        }
        await simpleDB.runQuery(query, simpleDB.connection, false, options)
        data = await simpleDB.runQuery(
            `SELECT * FROM ${options.table};`,
            simpleDB.connection,
            true,
            options
        )
    } else {
        throw new Error(
            `Unknown ${options.returnDataFrom} options.returnDataFrom`
        )
    }

    if (options.returnedDataModifier) {
        if (data === null) {
            throw new Error(
                "Data is null. Use option returnedDataModifier with 'query' or 'table'."
            )
        }
        data = options.returnedDataModifier(data)
    }

    if (options.debug) {
        if (Array.isArray(data)) {
            if (options.returnDataFrom === "query") {
                console.log(
                    `${addThousandSeparator(data.length)} rows in total`
                )
            } else if (typeof options.table === "string") {
                console.log(`\ntable ${options.table}:`)
                console.table(data)
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
        if (data === null) {
            throw new Error("data is null")
        }
        return data
    } else {
        return null
    }
}
