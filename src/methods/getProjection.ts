import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getProjection(
    SimpleWebDB: SimpleWebDB,
    file: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT layers[1].geometry_fields[1].crs.name as name, CONCAT(layers[1].geometry_fields[1].crs.auth_name, ':', layers[1].geometry_fields[1].crs.auth_code) as code, layers[1].geometry_fields[1].crs.projjson as unit, layers[1].geometry_fields[1].crs.proj4 as proj4 FROM st_read_meta('${file}')`,
        mergeOptions(SimpleWebDB, {
            table: null,
            method: "getProjection()",
            parameters: { file },
            returnDataFrom: "query",
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0]
    result.unit = JSON.parse(
        result.unit as string
    ).coordinate_system.axis[0].unit

    SimpleWebDB.debug && console.log("projection:", result)

    return result as { name: string; code: string; proj4: string }
}
