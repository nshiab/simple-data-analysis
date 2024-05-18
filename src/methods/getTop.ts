import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getTop(
    SimpleWebDB: SimpleWebDB,
    table: string,
    count: number,
    options: {
        condition?: string
    } = {}
) {
    const rows = await queryDB(
        SimpleWebDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT ${count}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getTop()",
            parameters: { table, count, options },
        })
    )

    if (!rows) {
        throw new Error("no rows")
    }

    SimpleWebDB.debug && console.log("Top rows:")
    SimpleWebDB.debug && console.table(rows)

    return rows
}
