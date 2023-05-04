import { Feature } from "@turf/turf"

export type SimpleDataValue =
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | Feature

export interface SimpleDataItem {
    [key: string]: SimpleDataValue
}
