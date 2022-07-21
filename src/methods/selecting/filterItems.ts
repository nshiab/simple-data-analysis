import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function filterItems(
    data: SimpleDataItem[],
    itemComparator: (item: SimpleDataItem) => boolean,
    verbose = false
): SimpleDataItem[] {
    const filteredData = data.filter((d) => itemComparator(d))

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
