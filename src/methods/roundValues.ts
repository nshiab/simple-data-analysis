import { SimpleDataItem, Options } from "../types.js"
import hasKey from "../helpers/hasKey.js"

export default function roundValues(data: SimpleDataItem[], key: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key] as number
        data[i][key] = parseFloat(val.toFixed(options.fractionDigits))
    }

    return data
}