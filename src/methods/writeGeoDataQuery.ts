import getExtension from "../helpers/getExtension.js"

export default function writeGeoDataQuery(table: string, file: string) {
    const fileExtension = getExtension(file)
    if (fileExtension === "geojson") {
        return `COPY ${table} to '${file}' WITH (FORMAT GDAL, DRIVER 'GeoJSON')`
    } else {
        throw new Error(`Unknown extension ${fileExtension}`)
    }
}
