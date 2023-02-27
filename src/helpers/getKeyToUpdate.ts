import { SimpleDataItem } from "../types/SimpleData.types.js"
import hasKey from "./hasKey.js"

export default function (
    data: SimpleDataItem[],
    key: string,
    newKey?: string
): string {
    if (!hasKey(data, key)) {
        throw new Error("No key " + key)
    }

    if (newKey && hasKey(data, newKey)) {
        throw new Error(newKey + " already exists")
    }

    return newKey ? newKey : key
}
