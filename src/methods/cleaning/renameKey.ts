import hasKey from "../../helpers/hasKey.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function renameKey(
    data: SimpleDataItem[],
    oldKey: string,
    newKey: string
): SimpleDataItem[] {
    hasKey(data, oldKey)
    hasKey(data, newKey, true)

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    return data
}
