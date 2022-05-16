import hasKey from "../helpers/hasKey.js"
import { SimpleDataItem, Options } from "../types.js"

export default function renameKey(data: SimpleDataItem[], oldKey: string, newKey: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], oldKey)) {
        throw new Error("No key " + oldKey)
    }

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    return data
}