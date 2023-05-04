import { FeatureCollection } from "@turf/turf"
import { SimpleDataItem } from "../types/SimpleData.types"

export default function geoDataToArrayOfObjects(
    geoData: FeatureCollection,
    firstItem: number,
    lastItem: number
) {
    const arrayOfObjects = []

    for (const feature of geoData.features.slice(firstItem, lastItem + 1)) {
        const properties = feature.properties
        feature.properties = {}
        arrayOfObjects.push({
            feature: feature,
            ...properties,
        })
    }

    return arrayOfObjects as SimpleDataItem[]
}
