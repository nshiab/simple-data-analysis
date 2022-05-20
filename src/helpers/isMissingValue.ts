import { SimpleDataValue } from "../types/SimpleData.types"

export default function isMissingValue(
    value: SimpleDataValue,
    missingValues: SimpleDataValue[]
): boolean {
    return missingValues.includes(value)
}
