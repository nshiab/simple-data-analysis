import { SimpleDataItem, Options } from "../types"
import hasKey from "../helpers/hasKey"

export default function removeKey(data: SimpleDataItem[], key: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        delete data[i][key]
    }

    return data
}