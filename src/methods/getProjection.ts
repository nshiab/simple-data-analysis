import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getProjection(
    simpleWebTable: SimpleWebTable,
    file: string
) {
    // Load spatial may not be necessary if we change how this works
    const queryResult = await queryDB(
        simpleWebTable,
        `INSTALL spatial;
        LOAD spatial;
        SELECT layers[1].geometry_fields[1].crs.name as name, CONCAT(layers[1].geometry_fields[1].crs.auth_name, ':', layers[1].geometry_fields[1].crs.auth_code) as code, layers[1].geometry_fields[1].crs.projjson as unit, layers[1].geometry_fields[1].crs.proj4 as proj4 FROM st_read_meta('${file}')`,
        mergeOptions(simpleWebTable, {
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

    simpleWebTable.debug && console.log("projection:", result)

    return result as { name: string; code: string; unit: string; proj4: string }
}
