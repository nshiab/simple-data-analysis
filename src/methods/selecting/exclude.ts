import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types"
import { log, toPercentage } from "../../exports/helpers.js"

export default function exclude(
    data: SimpleDataItem[],
    key: string,
    value: SimpleDataValue | SimpleDataValue[],
    verbose?: boolean
) {
    let filteredData: SimpleDataItem[] = []

    if (Array.isArray(value)) {
        filteredData = data.filter((d) => !value.includes(d[key]))
    } else {
        filteredData = data.filter((d) => d[key] !== value)
    }

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
