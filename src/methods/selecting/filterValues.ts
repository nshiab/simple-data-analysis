import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { log, toPercentage, hasKey } from "../../exports/helpers.js"

export default function filterValues(
    data: SimpleDataItem[],
    key: string,
    valueComparator: (val: SimpleDataValue) => SimpleDataValue,
    verbose = false
): SimpleDataItem[] {
    hasKey(data, key)

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
