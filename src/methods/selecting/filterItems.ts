import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { log, toPercentage } from "../../exports/helpers.js"

export default function filterItems(
    data: SimpleDataItem[],
    itemComparator: (item: SimpleDataItem) => boolean,
    verbose = false
): SimpleDataItem[] {
    const filteredData = data.filter((d) => itemComparator(d))

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
