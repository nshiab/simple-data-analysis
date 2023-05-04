import { SimpleDataItem } from "../types/SimpleData.types"

export default function hasKey(
    data: SimpleDataItem[],
    key: string,
    newKey = false
) {
    if (data.length === 0) {
        throw new Error("Data is empty (length equals 0).")
    }

    const test = Object.prototype.hasOwnProperty.call(data[0], key)
    if (newKey && test) {
        throw new Error(`Key ${key} already exists in data`)
    } else if (!newKey && !test) {
        throw new Error(`No key ${key} in data`)
    }
}
