import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getProjection(simpleDB: SimpleDB, file: string) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT layers[1].geometry_fields[1].crs.name as name, CONCAT(layers[1].geometry_fields[1].crs.auth_name, ':', layers[1].geometry_fields[1].crs.auth_code) as code, layers[1].geometry_fields[1].crs.proj4 as proj4 FROM st_read_meta('${file}')`,
        mergeOptions(simpleDB, {
            table: null,
            method: file,
            parameters: { file },
            returnDataFrom: "query",
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0]

    simpleDB.debug && console.log("projection:", result)

    return result as { name: string; code: string }
}
