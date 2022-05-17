import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types/SimpleData.types.js"
import percentage from "../helpers/percentage.js"

export default function filterItems(data: SimpleDataItem[], func: (item: any) => any, options: Options): SimpleDataItem[] {

    const filteredData = data.filter(d => func(d))

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")

    return filteredData
}