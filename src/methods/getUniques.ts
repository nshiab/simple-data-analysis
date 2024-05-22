import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getUniques(
    simpleWebTable: SimpleWebTable,
    column: string
) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT DISTINCT "${column}" FROM ${simpleWebTable.name} ORDER BY ${column} ASC`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getUniques()",
            parameters: { column },
        })
    )

    if (!queryResult) {
        throw new Error("No result.")
    }

    const uniques = queryResult.map((d) => d[column])

    simpleWebTable.debug && console.log("uniques:", uniques)

    return uniques
}
