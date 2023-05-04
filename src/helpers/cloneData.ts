import { FeatureCollection } from "@turf/turf"
import { SimpleDataItem } from "../types/SimpleData.types"

export default function cloneData(
    data: SimpleDataItem[] | FeatureCollection,
    stringify = false
) {
    if (Array.isArray(data) && stringify === false) {
        return data.map((item) => ({ ...item }))
    } else {
        return JSON.parse(JSON.stringify(data))
    }
}
