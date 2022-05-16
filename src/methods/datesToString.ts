import { SimpleDataItem, Options } from "../types"
import { utcFormat } from "d3-time-format"
import hasKey from "../helpers/hasKey"

export default function datesToString(data: SimpleDataItem[], key: string, format: string, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    const formatF = utcFormat(format)

    for (let i = 0; i < data.length; i++) {
        data[i][key] = formatF(data[i][key])
    }

    return data
}