import { SimpleDataItem } from "../../types/SimpleData.types.js"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function valuesToString(
    data: SimpleDataItem[],
    key: string,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = String(data[i][key])
    }

    return data
}
