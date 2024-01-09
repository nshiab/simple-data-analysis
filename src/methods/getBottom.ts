import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getBottom(
    simpleDB: SimpleDB,
    table: string,
    count: number,
    options: {
        originalOrder?: boolean
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        simpleDB,
        `WITH numberedRowsForGetBottom AS (
                SELECT *, row_number() OVER () as rowNumberForGetBottom FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetBottom ORDER BY rowNumberForGetBottom DESC LIMIT ${count};`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getBottom()",
            parameters: { table, count, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResult")
    }

    const rowsRaw = queryResult.map((d) => {
        delete d.rowNumberForGetBottom
        return d
    })
    const rows = options.originalOrder ? rowsRaw.reverse() : rowsRaw

    simpleDB.debug && console.log("Bottom rows:")
    simpleDB.debug && console.table(rows)

    return rows
}
