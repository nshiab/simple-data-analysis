import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getLastRow(
    SimpleWebDB: SimpleWebDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `WITH numberedRowsForGetLastRow AS (
                SELECT *, row_number() OVER () as rowNumberForGetLastRow FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetLastRow ORDER BY rowNumberForGetLastRow DESC LIMIT 1;`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getLastRow()",
            parameters: { table, options },
        })
    )
    if (!queryResult) {
        throw new Error("No queryResult")
    }
    const result = queryResult[0]
    delete result.rowNumberForGetLastRow

    SimpleWebDB.debug && console.log("last row:", result)

    return result
}
