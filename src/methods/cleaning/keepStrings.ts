import log from "../../helpers/log.js"
import toPercentage from "../../helpers/toPercentage.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function keepStrings(
    data: SimpleDataItem[],
    key: string,
    keepNonStringOnly = false,
    verbose?: boolean
) {
    verbose &&
        log("Keeping only strings. Excluding empty strings ('') as well.")
    const filteredData = data.filter((d) => {
        const test = typeof d[key] === "string" && d[key] !== ""
        return keepNonStringOnly ? !test : test
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
