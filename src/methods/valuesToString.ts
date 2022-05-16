import { SimpleDataItem, Options } from "../types"
import hasKey from "../helpers/hasKey"

export default function valuesToString(data: SimpleDataItem[], key: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = String(data[i][key])
    }

    return data
}