import { SimpleDataItem } from "../types/SimpleData.types.js"
import { hasKey } from "../exports/helpers.js"

export default function (
    data: SimpleDataItem[],
    key: string,
    newKey?: string
): string {
    hasKey(data, key)
    newKey && hasKey(data, newKey, true)

    return newKey ? newKey : key
}
