import { SimpleDataItem } from "../../types/SimpleData.types.js"
import sortValues from "./sortValues.js"

export default function addRank(
    data: SimpleDataItem[],
    rankTitle: string,
    rankBy?: string | string[],
    sort?: true | false,
    locale?: string | (string | undefined | null | boolean)[],
    handleTies?: "sequential" | "indexWithTie" | "indexWithoutTie"
): SimpleDataItem[] {
    if (!rankBy) {
        data.map((datum, i) => {
            datum[rankTitle] = i + 1
        })
    } else {
        const sortData = sort ? data : data.slice(0)
        const sortedDataItems = sortValues(
            sortData,
            rankBy,
            "descending",
            locale && locale
        )
        sortedDataItems.map((datum, i) => {
            let rank = 1
            if (i > 0) {
                let sameAsPrevious = true
                if (Array.isArray(rankBy)) {
                    for (const item in rankBy) {
                        if (
                            sortedDataItems[i - 1][rankBy[item]] !==
                            datum[rankBy[item]]
                        )
                            sameAsPrevious = false
                    }
                } else {
                    if (sortedDataItems[i - 1][rankBy] !== datum[rankBy])
                        sameAsPrevious = false
                }
                if (sameAsPrevious) {
                    if (handleTies && handleTies === "indexWithoutTie") {
                        rank = i + 1
                    } else {
                        rank = <number>(
                            sortedDataItems[i - 1][`${rankTitle}Rank`]
                        )
                    }
                } else {
                    if (!handleTies || handleTies === "sequential") {
                        rank =
                            <number>sortedDataItems[i - 1][`${rankTitle}Rank`] +
                            1
                    } else if (
                        handleTies === "indexWithTie" ||
                        handleTies === "indexWithoutTie"
                    ) {
                        rank = i + 1
                    }
                }
            }
            data.filter((oldDatum) => datum === oldDatum)[0][
                `${rankTitle}Rank`
            ] = rank
        })
    }

    return data
}
