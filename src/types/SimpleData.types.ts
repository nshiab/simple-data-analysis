export type SimpleDataValue = string | number | boolean | Date | null | undefined

export interface SimpleDataItem {
    [key: string]: SimpleDataValue
}