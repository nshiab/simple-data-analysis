import log from "../helpers/log"
import { SimpleDataItem, Options } from "../types"
import percentage from "../helpers/percentage"


export default function filterItems(
    data: SimpleDataItem[], 
    func: (val: any) => any, 
    options: Options
): SimpleDataItem[] {

    const filteredData = data.filter(d => func(d))

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")

    return filteredData
}