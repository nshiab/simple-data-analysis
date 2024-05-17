import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getValues(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT "${column}" FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getValues()",
            parameters: { table, column },
        })
    )
    if (!queryResult) {
        throw new Error("No result")
    }

    const values = queryResult.map((d) => d[column])

    simpleDB.debug && console.log("values:", values)

    return values
}
