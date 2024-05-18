import SimpleWebDB from "../class/SimpleWebDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

export default async function getGeoData(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT * EXCLUDE "${column}", ST_AsGeoJSON("${column}") as geoJsonFragment from ${table};`,
        mergeOptions(SimpleWebDB, {
            table: null,
            method: "getGeoData()",
            parameters: { table, column },
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
