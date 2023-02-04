import { AllGeoJSON, centroid } from "@turf/turf"
import hasKey from "../../helpers/hasKey.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function addCentroid(
    data: SimpleDataItem[],
    key: string,
    newKey = "centroid"
) {
    if (!hasKey) {
        throw new Error(`No key ${key} in data`)
    }

    // Check if valid geoJson?

    for (let i = 0; i < data.length; i++) {
        data[i][newKey] = centroid(data[i][key] as AllGeoJSON)
    }

    return data
}
