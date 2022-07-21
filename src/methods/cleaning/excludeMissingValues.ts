import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

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
                if (missingValues.includes(val)) {
                    check = false
                    break
                }
            }
            return check
        })
    } else if (helpers.hasKey(data[0], key)) {
        filteredData = data.filter((d) => !missingValues.includes(d[key]))
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    verbose &&
        helpers.log(
            `/!\\ ${nbRemoved} items removed, representing ${helpers.toPercentage(
                nbRemoved,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return filteredData
}
