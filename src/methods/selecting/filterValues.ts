import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function filterValues(
    data: SimpleDataItem[],
    key: string,
    valueComparator: (val: SimpleDataValue) => SimpleDataValue,
    verbose = false
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    const filteredData = data.filter((d) => valueComparator(d[key]))

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
