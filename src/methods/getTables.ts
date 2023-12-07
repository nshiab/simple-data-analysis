import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getTables(simpleDB: SimpleDB) {
    simpleDB.debug && console.log("\ngetTables()")

    const queryResult = await queryDB(
        simpleDB,
        `SHOW TABLES`,
        mergeOptions(simpleDB, {
            returnDataFrom: "query",
            table: null,
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const tables = queryResult.map((d) => d.name) as string[]

    simpleDB.debug && console.log("\ntables:", tables)

    return tables
}
