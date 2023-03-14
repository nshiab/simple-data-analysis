import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { shuffler } from "d3-array"
import { randomLcg } from "d3-random"
import { log, toPercentage } from "../../exports/helpers.js"

export default function pickRandomItems(
    data: SimpleDataItem[],
    nbItems = 100,
    seed?: number,
    verbose = false
): SimpleDataItem[] {
    if (nbItems <= 0) {
        throw new Error("You must choose a number of items greater than 0")
    }
    if (nbItems > data.length) {
        nbItems = data.length
    }

    const shuffle = seed ? shuffler(randomLcg(seed)) : shuffler(randomLcg())
    const randomizedData = shuffle(data).slice(0, nbItems)
    const nbRemoved = data.length - nbItems
    verbose &&
        log(
            `/!\\ ${nbRemoved} items removed, representing ${toPercentage(
                nbRemoved,
                data.length
            )} of received items. Remaining items randomized in order.`,
            "bgRed"
        )
    return randomizedData
}
