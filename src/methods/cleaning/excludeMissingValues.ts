import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { log, toPercentage } from "../../exports/helpers.js"

export default function excludeMissingValues(
    data: SimpleDataItem[],
    key?: string,
    missingValues: SimpleDataValue[] = [null, NaN, undefined, ""],
    verbose = false,
    keepMissingValuesOnly = false
): SimpleDataItem[] {
    let filteredData: SimpleDataItem[] = []

    if (key === undefined) {
        filteredData = data.filter((d) => {
            let check = true
            const values = Object.values(d)
            for (const val of values) {
                if (missingValues.includes(val)) {
                    check = false
                    break
                }
            }
            return keepMissingValuesOnly ? !check : check
        })
    } else if (Object.prototype.hasOwnProperty.call(data[0], key)) {
        filteredData = data.filter((d) => !missingValues.includes(d[key]))
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    verbose &&
        log(
            `/!\\ ${nbRemoved} items removed, representing ${toPercentage(
                nbRemoved,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return filteredData
}
