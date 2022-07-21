import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function removeKey(
    data: SimpleDataItem[],
    key: string
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        delete data[i][key]
    }

    return data
}
