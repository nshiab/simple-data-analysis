import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getTables(simpleDB: SimpleDB) {
    const queryResult = await queryDB(
        simpleDB,
        `SHOW TABLES`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("tables:", tables)

    return tables
}
