import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getTop(
    simpleDB: SimpleDB,
    table: string,
    count: number,
    options: {
        condition?: string
    } = {}
) {
    const rows = await queryDB(
        simpleDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT ${count}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getTop()",
            parameters: { table, count, options },
        })
    )

    if (!rows) {
        throw new Error("no rows")
    }

    simpleDB.debug && console.log("Top rows:")
    simpleDB.debug && console.table(rows)

    return rows
}
