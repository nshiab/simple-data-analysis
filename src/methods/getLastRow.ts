import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getLastRow(
    simpleDB: SimpleDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    simpleDB.debug && console.log("\ngetLastRow()")
    const queryResult = await queryDB(
        simpleDB,
        `WITH numberedRowsForGetLastRow AS (
                SELECT *, row_number() OVER () as rowNumberForGetLastRow FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetLastRow ORDER BY rowNumberForGetLastRow DESC LIMIT 1;`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )
    if (!queryResult) {
        throw new Error("No queryResult")
    }
    delete queryResult[0].rowNumberForGetLastRow
    return queryResult[0]
}
