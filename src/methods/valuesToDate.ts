import { SimpleDataItem, Options } from "../types/SimpleData.types.js"
import { utcParse } from "d3-time-format"
import hasKey from "../helpers/hasKey.js"

export default function valuesToDate(data: SimpleDataItem[], key: string, format: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (typeof data[0][key] !== "string") {
        throw new Error("Key " + key + " should be a string.")
    }

    const parse = utcParse(format)

    for (let i = 0; i < data.length; i++) {
        data[i][key] = parse(data[i][key] as string) as Date
    }

    return data
}