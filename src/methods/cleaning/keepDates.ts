import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function keepDates(
    data: SimpleDataItem[],
    key: string,
    verbose?: boolean
) {
    verbose && log("Keeping only Dates. Excluding invalid Dates as well.")
    const filteredData = data.filter(
        (d) => d[key] instanceof Date && !isNaN(d[key] as number) // in fact, it's a Date
    )

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
