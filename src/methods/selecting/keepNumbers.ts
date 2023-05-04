import { SimpleDataItem } from "../../types/SimpleData.types"
import { log, toPercentage } from "../../exports/helpers.js"

export default function keepNumbers(
    data: SimpleDataItem[],
    key: string,
    keepNonNumbersOnly = false,
    verbose?: boolean
) {
    verbose && log("Keeping only numbers. Excluding NaN values as well.")
    const filteredData = data.filter((d) => {
        const test = typeof d[key] === "number" && !Number.isNaN(d[key])
        return keepNonNumbersOnly ? !test : test
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
