import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import percentage from "../../helpers/percentage.js"

export default function filterItems(
    data: SimpleDataItem[],
    itemComparator: (item: SimpleDataItem) => boolean,
    verbose: boolean
): SimpleDataItem[] {
    const filteredData = data.filter((d) => itemComparator(d))

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
