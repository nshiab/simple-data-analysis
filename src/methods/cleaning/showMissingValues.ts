import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function showMissingValues(
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
                if (missingValues.includes(val)) {
                    check = false
                    break
                }
            }
            return !check // adding ! is the only difference with excludeMissingValues.ts
        })
    } else if (hasKey(data[0], key)) {
        filteredData = data.filter((d) => missingValues.includes(d[key])) // removing ! before missingValues is the only difference with excludeMissingValues.ts
    } else {
        throw new Error("No key " + key)
    }

    const nbMissing = data.length - filteredData.length
    verbose &&
        log(
            `/!\\ ${nbMissing} items with missing values, representing ${toPercentage(
                nbMissing,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return filteredData
}
