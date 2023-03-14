import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { hasKey } from "../../exports/helpers.js"

export default function removeKey(
    data: SimpleDataItem[],
    key: string
): SimpleDataItem[] {
    hasKey(data, key)

    for (let i = 0; i < data.length; i++) {
        delete data[i][key]
    }

    return data
}
