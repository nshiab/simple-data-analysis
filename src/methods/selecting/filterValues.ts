import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import { log, hasKey, toPercentage } from "../../helpers/index.js"

export default function filterValues(
    data: SimpleDataItem[],
    key: string,
    valueComparator: (val: SimpleDataValue) => SimpleDataValue,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    const filteredData = data.filter((d) => valueComparator(d[key]))

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
