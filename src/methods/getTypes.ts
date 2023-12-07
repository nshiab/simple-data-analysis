import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getTypes(simpleDB: SimpleDB, table: string) {
    simpleDB.debug && console.log("\ngetTypes()")
    simpleDB.debug && console.log("parameters:", { table })

    const types = await queryDB(
        simpleDB,
        `DESCRIBE ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
        })
    )

    const typesObj: { [key: string]: string } = {}
    if (types) {
        for (const t of types as { [key: string]: string }[]) {
            if (t.column_name) {
                typesObj[t.column_name] = t.column_type
            }
        }
    }

    simpleDB.debug && console.log("\ntypes:", typesObj)

    return typesObj
}
