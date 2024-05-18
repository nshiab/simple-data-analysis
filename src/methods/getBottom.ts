import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getBottom(
    SimpleWebDB: SimpleWebDB,
    table: string,
    count: number,
    options: {
        originalOrder?: boolean
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `WITH numberedRowsForGetBottom AS (
                SELECT *, row_number() OVER () as rowNumberForGetBottom FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetBottom ORDER BY rowNumberForGetBottom DESC LIMIT ${count};`,
        mergeOptions(SimpleWebDB, {
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

    SimpleWebDB.debug && console.log("Bottom rows:")
    SimpleWebDB.debug && console.table(rows)

    return rows
}
