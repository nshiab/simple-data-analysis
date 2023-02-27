import { SimpleDataItem } from "../types/SimpleData.types"

export default function hasKey(data: SimpleDataItem[], key: string) {
    if (data.length === 0) {
        throw new Error("Data is empty (length equals 0).")
    }
    return Object.prototype.hasOwnProperty.call(data[0], key)
}
