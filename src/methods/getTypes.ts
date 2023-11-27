import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getTypes(
    simpleDB: SimpleDB,
    table: string,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetTypes()")

    const types = await queryDB(
        simpleDB,
        `DESCRIBE ${table}`,
        mergeOptions(simpleDB, {
            ...options,
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

    ;(options.debug || simpleDB.debug) && console.log("\ntypes:", typesObj)

    return typesObj
}
