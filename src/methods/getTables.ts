import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getTables(SimpleWebDB: SimpleWebDB) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SHOW TABLES`,
        mergeOptions(SimpleWebDB, {
            returnDataFrom: "query",
            table: null,
            method: "getTables",
            parameters: {},
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const tables = queryResult.map((d) => d.name) as string[]

    SimpleWebDB.debug && console.log("tables:", tables)

    return tables
}
