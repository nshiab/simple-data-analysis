import isMissingValue from "../../helpers/isMissingValue.js"
import log from "../../helpers/log.js"
import percentage from "../../helpers/percentage.js"
import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function excludeMissingValues(
    data: SimpleDataItem[],
    key?: string,
    missingValues: SimpleDataValue[] = [null, NaN, undefined, ""],
    verbose = false
): SimpleDataItem[] {
    let filteredData: SimpleDataItem[] = []

    if (key === undefined) {
        filteredData = data.filter((d) => {
            let check = true
            const values = Object.values(d)
            for (const val of values) {
                if (isMissingValue(val, missingValues)) {
                    check = false
                    break
                }
            }
            return check
        })
    } else if (hasKey(data[0], key)) {
        filteredData = data.filter(
            (d) => !isMissingValue(d[key], missingValues)
        )
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    verbose &&
        log(
            `/!\\ ${nbRemoved} items removed, representing ${percentage(
                nbRemoved,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return filteredData
}
