import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function keepDates(
    data: SimpleDataItem[],
    key: string,
    keepNonDatesOnly = false,
    verbose?: boolean
) {
    verbose && log("Keeping only Dates. Excluding invalid Dates as well.")
    const filteredData = data.filter((d) => {
        const test = d[key] instanceof Date && !isNaN(d[key] as number) // in fact, it's a Date
        return keepNonDatesOnly ? !test : test
    })

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
