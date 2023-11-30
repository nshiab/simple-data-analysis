import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getTop(
    simpleDB: SimpleDB,
    table: string,
    count: number,
    options: {
        condition?: string
    } = {}
) {
    simpleDB.debug && console.log("\ngetTop()")

    const rows = await queryDB(
        simpleDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT ${count}`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )

    if (!rows) {
        throw new Error("no rows")
    }

    return rows
}
