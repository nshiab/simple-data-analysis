import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getTables(simpleWebDB: SimpleWebDB) {
    const queryResult = await queryDB(
        simpleWebDB,
        `SHOW TABLES`,
        mergeOptions(simpleWebDB, {
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

    simpleWebDB.debug && console.log("tables:", tables)

    return tables
}
