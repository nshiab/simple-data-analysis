export default function getFirstNonNullOrUndefinedValues(
    arrayOfObjects: { [key: string]: unknown }[]
) {
    const columns = Object.keys(arrayOfObjects[0])
    const values = []

    for (const col of columns) {
        let value = undefined
        for (const d of arrayOfObjects) {
            if (d[col] !== null && d[col] !== undefined) {
                value = d[col]
                break
            }
        }
        if (value !== undefined) {
            values.push(value)
        } else {
            values.push("")
        }
    }
    return values
}
