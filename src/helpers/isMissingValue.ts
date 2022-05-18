export default function isMissingValue(value: any, missingValues: any[]): boolean {
    return missingValues.includes(value)
}