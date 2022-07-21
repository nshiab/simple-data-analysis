import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function keepMissingValues(
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
    } else if (helpers.hasKey(data[0], key)) {
        filteredData = data.filter((d) => missingValues.includes(d[key])) // removing ! before missingValues is the only difference with excludeMissingValues.ts
    } else {
        throw new Error("No key " + key)
    }

    const nbMissing = filteredData.length
    verbose &&
        helpers.log(
            `/!\\ ${nbMissing} items with missing values, representing ${helpers.toPercentage(
                nbMissing,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return filteredData
}
