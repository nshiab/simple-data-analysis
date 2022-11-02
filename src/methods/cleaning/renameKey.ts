import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function renameKey(
    data: SimpleDataItem[],
    oldKey: string,
    newKey: string
): SimpleDataItem[] {
    getKeyToUpdate(data, oldKey, newKey) // ignore returning value

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    return data
}
