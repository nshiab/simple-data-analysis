import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getColumns(simpleWebTable: SimpleWebTable) {
    const queryResult = await queryDB(
        simpleWebTable,
        `DESCRIBE ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getColumns()",
            parameters: {},
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const columns = queryResult.map((d) => d.column_name) as string[]

    simpleWebTable.debug && console.log("columns:", columns)

    return columns
}
