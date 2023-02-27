import hasKey from "../../helpers/hasKey.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function renameKey(
    data: SimpleDataItem[],
    oldKey: string,
    newKey: string
): SimpleDataItem[] {
    if (!hasKey(data, oldKey)) {
        throw new Error("No key " + oldKey)
    }

    if (newKey && hasKey(data, newKey)) {
        throw new Error(newKey + " already exists")
    }

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    return data
}
