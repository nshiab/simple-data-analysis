import SimpleWebTable from "../class/SimpleWebTable.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

export default async function getGeoData(
    simpleWebTable: SimpleWebTable,
    column: string
) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT * EXCLUDE "${column}", ST_AsGeoJSON("${column}") as geoJsonFragment from ${simpleWebTable.name};`,
        mergeOptions(simpleWebTable, {
            table: null,
            method: "getGeoData()",
            parameters: { column },
            returnDataFrom: "query",
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const features = queryResult.map((d) => {
        const { geoJsonFragment, ...properties } = d
        const geometry = JSON.parse(geoJsonFragment as string)

        const feature = {
            type: "Feature",
            geometry,
            properties,
        }

        return feature
    })

    return {
        type: "FeatureCollection",
        features,
    }
}
