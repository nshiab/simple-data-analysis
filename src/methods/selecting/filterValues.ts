import log from "../../helpers/log.js"
import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import toPercentage from "../../helpers/toPercentage.js"
import hasKey from "../../helpers/hasKey.js"

export default function filterValues(
    data: SimpleDataItem[],
    key: string,
    valueComparator: (val: SimpleDataValue) => SimpleDataValue,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data, key)) {
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
