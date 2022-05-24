import log from "../../helpers/log.js"
import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import percentage from "../../helpers/percentage.js"
import hasKey from "../../helpers/hasKey.js"

export default function filterValues(
    data: SimpleDataItem[],
    key: string,
    valueComparator: (val: SimpleDataValue) => SimpleDataValue,
    verbose: boolean
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    const filteredData = data.filter((d) => valueComparator(d[key]))

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
