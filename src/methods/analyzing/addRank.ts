import { SimpleDataItem } from "../../types/SimpleData.types.js"
import sortValues from "./sortValues.js"
import hasKey from "../../helpers/hasKey.js"
export default function addRank(
    data: SimpleDataItem[],
    newKey: string,
    key?: string | string[],
    sortInPlace?: true | false,
    order?: "ascending" | "descending",
    handleTies?: "tieNoGaps" | "tie" | "noTie",
    locale?: string | (string | undefined | null | boolean)[]
): SimpleDataItem[] {
    if (hasKey(data, newKey)) {
        throw new Error(`The newKey ${newKey} already exists`)
    }
    if (!key) {
        data.map((datum, i) => {
            datum[newKey] = i + 1
        })
    } else {
        const sortData = sortInPlace ? data : data.slice(0)

        const sortedDataItems = sortValues(
            sortData,
            key,
            order === undefined ? "descending" : order,
            locale && locale
        )
        sortedDataItems.map((datum, i) => {
            let rank = 1
            if (i > 0) {
                let sameAsPrevious = true
                if (Array.isArray(key)) {
                    for (const item in key) {
                        if (
                            sortedDataItems[i - 1][key[item]] !==
                            datum[key[item]]
                        )
                            sameAsPrevious = false
                    }
                } else {
                    if (sortedDataItems[i - 1][key] !== datum[key])
                        sameAsPrevious = false
                }
                if (sameAsPrevious) {
                    if (handleTies && handleTies === "noTie") {
                        rank = i + 1
                    } else {
                        rank = sortedDataItems[i - 1][newKey] as number
                    }
                } else {
                    if (!handleTies || handleTies === "tieNoGaps") {
                        rank = (sortedDataItems[i - 1][newKey] as number) + 1
                    } else if (handleTies === "tie" || handleTies === "noTie") {
                        rank = i + 1
                    }
                }
            }
            data.filter((oldDatum) => datum === oldDatum)[0][newKey] = rank
        })
    }

    return data
}
