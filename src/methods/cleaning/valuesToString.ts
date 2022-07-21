import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function valuesToString(
    data: SimpleDataItem[],
    key: string
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = String(data[i][key])
    }

    return data
}
