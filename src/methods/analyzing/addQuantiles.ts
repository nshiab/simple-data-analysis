import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { range } from "d3-array"
import { scaleQuantile } from "d3-scale"
import hasKey from "../../helpers/hasKey.js"

export default function addQuantiles(
    data: SimpleDataItem[],
    key: string,
    newKey: string,
    nbQuantiles: number
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (hasKey(data[0], newKey)) {
        throw new Error("Already a key named " + key)
    }
    if (nbQuantiles < 1) {
        throw new Error("nbQuantiles should always be > 0.")
    }

    const quantileGenerator = scaleQuantile()
        .domain(data.map((d) => d[key] as number))
        .range(range(1, nbQuantiles + 1))

    for (let i = 0; i < data.length; i++) {
        const value = data[i][key] as number
        const quantile = quantileGenerator(value)
        data[i][newKey] = quantile
    }

    return data
}
