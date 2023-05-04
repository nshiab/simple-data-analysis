import { centroid, Feature } from "@turf/turf"
import hasKey from "../../helpers/hasKey.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function addCentroid(
    data: SimpleDataItem[],
    key = "feature",
    newKey = "centroid"
) {
    hasKey(data, key)
    hasKey(data, newKey, true)

    for (let i = 0; i < data.length; i++) {
        data[i][newKey] = centroid(data[i][key] as Feature)
    }

    return data
}
