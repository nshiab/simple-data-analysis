import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getNbRows(simpleWebTable: SimpleWebTable) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT COUNT(*) FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getLength()",
            parameters: {},
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }
    const length = queryResult[0]["count_star()"] as number

    simpleWebTable.debug && console.log("length:", length)

    return length
}
