import { centroid } from "@turf/turf"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function addCentroid(
    data: SimpleDataItem[],
    key: string,
    newKey = "centroid"
) {
    // check key and newkey exist / don't exist
    for (let i = 0; i < data.length; i++) {
        data[i][newKey] = centroid(data[i][key])
    }
}
