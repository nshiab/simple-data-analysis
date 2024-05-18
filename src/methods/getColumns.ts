import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getColumns(
    SimpleWebDB: SimpleWebDB,
    table: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `DESCRIBE ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getColumns()",
            parameters: { table },
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const columns = queryResult.map((d) => d.column_name) as string[]

    SimpleWebDB.debug && console.log("columns:", columns)

    return columns
}
