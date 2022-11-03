import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import toPercentage from "../../helpers/toPercentage.js"
import { shuffler } from "d3-array"
import { randomLcg } from "d3-random"

export default function pickRandomItems(
    data: SimpleDataItem[],
    nbItems = 100,
    seed?: number,
    verbose = false
): SimpleDataItem[] {
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
