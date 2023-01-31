import { Geometry, GeometryCollection } from "@turf/turf"

export type SimpleDataValue =
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | Geometry
    | GeometryCollection

export interface SimpleDataItem {
    [key: string]: SimpleDataValue
}
