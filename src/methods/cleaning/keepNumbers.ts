import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function keepNumbers(
    data: SimpleDataItem[],
    key: string,
    verbose?: boolean
) {
    verbose && log("Keeping only numbers. Excluding NaN values as well.")
    const filteredData = data.filter(
        (d) => typeof d[key] === "number" && !Number.isNaN(d[key])
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
