import isMissingValue from "../helpers/isMissingValue.js"
import log from "../helpers/log.js"
import percentage from "../helpers/percentage.js"
import { SimpleDataItem, Options } from "../types.js"

export default function excludeMissingValues(data: SimpleDataItem[], key: string | undefined, options: Options): SimpleDataItem[] {

    let filteredData: SimpleDataItem[] = []

    if (key === undefined || key === "onAllKeys") {
        filteredData = data.filter(d => {
            let check = true
            //@ts-ignore
            const values = Object.values(d)
            for (let val of values) {
                if (isMissingValue(val, options)) {
                    check = false
                    break
                }
            }
            return check
        })
    } else if (data[0].hasOwnProperty(key)) {
        filteredData = data.filter(d => !isMissingValue(d[key], options))
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")

    return filteredData
}