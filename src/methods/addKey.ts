import { SimpleDataItem, Options } from "../types/SimpleData.types.js"
import hasKey from "../helpers/hasKey.js"

export default function addKey(data: SimpleDataItem[], key: string, func: (item: any) => any, options: Options): SimpleDataItem[] {

    if (hasKey(data[0], key)) {
        throw new Error("Already a key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = func(data[i])
    }

    return data
}