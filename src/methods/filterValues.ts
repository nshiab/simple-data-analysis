import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types.js"
import percentage from "../helpers/percentage.js"
import hasKey from "../helpers/hasKey.js"

export default function filterValues(data: SimpleDataItem[], key: string, func: (val: any) => any, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    const filteredData = data.filter(d => func(d[key]))

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")

    return filteredData
}