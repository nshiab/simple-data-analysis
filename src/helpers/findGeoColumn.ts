import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function findGeoColumn(simpleWebTable: SimpleWebTable) {
    let column

    const types = await simpleWebTable.getTypes()
    const geometries = Object.values(types).filter(
        (d) => d.toLowerCase() === "geometry"
    )
    if (geometries.length === 0) {
        throw new Error("No column storing geometries")
    } else if (geometries.length > 1) {
        throw new Error(
            "More than one column storing geometries. If the method allows to specify one, do it. Otherwise, use the selectColumns methods beforehand."
        )
    } else {
        column = Object.keys(types).find(
            (d) => types[d].toLowerCase() === "geometry"
        )
    }
    if (typeof column !== "string") {
        throw new Error("No column")
    }
    return column
}
