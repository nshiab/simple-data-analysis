import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getTypes(
    SimpleWebDB: SimpleWebDB,
    table: string
) {
    const types = await queryDB(
        SimpleWebDB,
        `DESCRIBE ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getTypes()",
            parameters: { table },
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

    SimpleWebDB.debug && console.log("types:", typesObj)

    return typesObj
}
