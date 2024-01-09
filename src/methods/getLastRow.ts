import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getLastRow(
    simpleDB: SimpleDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        simpleDB,
        `WITH numberedRowsForGetLastRow AS (
                SELECT *, row_number() OVER () as rowNumberForGetLastRow FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetLastRow ORDER BY rowNumberForGetLastRow DESC LIMIT 1;`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("last row:", result)

    return result
}
