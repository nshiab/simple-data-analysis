import { SimpleDataValue } from "../types/SimpleData.types";

export default function isMissingValue(value: any, missingValues: SimpleDataValue[]): boolean {
    return missingValues.includes(value)
}