import { SimpleDataItem, Options } from "../types.js"
import hasKey from "../helpers/hasKey.js"

export default function modifyValues(data: SimpleDataItem[], key: string, func: (val: any) => any, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = func(data[i][key])
    }

    return data
}