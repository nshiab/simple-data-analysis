import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function valuesToString(
    data: SimpleDataItem[],
    key: string,
    newKey?: string
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (newKey && hasKey(data[0], newKey)) {
        throw new Error(newKey + " already exists")
    }

    const keyToUpdate = newKey ? newKey : key

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = String(data[i][key])
    }

    return data
}
