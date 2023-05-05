import { FeatureCollection } from "@turf/turf"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"

export default function cloneData(
    data:
        | SimpleDataItem
        | SimpleDataItem[]
        | FeatureCollection
        | { [key: string]: SimpleDataValue[] },
    stringify = false
) {
    if (Array.isArray(data) && stringify === false) {
        return data.map((item) => ({ ...item }))
    } else {
        return JSON.parse(JSON.stringify(data))
    }
}
