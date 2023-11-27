import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getTables(
    simpleDB: SimpleDB,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetTables()")

    const queryResult = await queryDB(
        simpleDB,
        `SHOW TABLES`,
        mergeOptions(simpleDB, {
            ...options,
            returnDataFrom: "query",
            table: null,
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const tables = queryResult.map((d) => d.name) as string[]

    ;(options.debug || simpleDB.debug) && console.log("\ntables:", tables)

    return tables
}
