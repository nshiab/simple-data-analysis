import SimpleWebTable from "../class/SimpleWebTable.js"

export default function (simpleWebTable: SimpleWebTable) {
    return [
        "WGS84",
        "EPSG:4326",
        "+proj=longlat +datum=WGS84 +no_defs",
    ].includes(simpleWebTable.proj4?.toUpperCase() ?? "")
}
