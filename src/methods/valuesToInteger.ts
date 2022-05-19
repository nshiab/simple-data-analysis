import { SimpleDataItem } from "../types/SimpleData.types.js"
import hasKey from "../helpers/hasKey.js"

export default function valuesToInteger(data: SimpleDataItem[], key: string): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key] as string
        data[i][key] = parseInt(val)
    }

    return data
}