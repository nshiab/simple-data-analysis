import isMissingValue from "../helpers/isMissingValue"
import log from "../helpers/log"
import percentage from "../helpers/percentage"
import { SimpleDataItem, Options } from "../types"
import hasKey from "../helpers/hasKey"

export default function excludeMissingValues(data: SimpleDataItem[], key: string | undefined, options: Options): SimpleDataItem[] {

    let filteredData: SimpleDataItem[] = []

    if (key === undefined || key === "onAllKeys") {
        filteredData = data.filter(d => {
            let check = true
            const values = Object.values(d)
            for (const val of values) {
                if (isMissingValue(val, options)) {
                    check = false
                    break
                }
            }
            return check
        })
    } else if (hasKey(data[0], key)) {
        filteredData = data.filter(d => !isMissingValue(d[key], options))
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")

    return filteredData
}