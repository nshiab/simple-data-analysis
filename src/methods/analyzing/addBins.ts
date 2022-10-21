import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { range, extent } from "d3-array"
import hasKey from "../../helpers/hasKey.js"
import { scaleQuantize } from "d3-scale"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"

export default function addBins(
    data: SimpleDataItem[],
    key: string,
    newKey: string,
    nbBins: number,
    nbTestedValues = 10000,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (hasKey(data[0], newKey)) {
        throw new Error("Already a key named " + key)
    }
    if (nbBins < 1) {
        throw new Error("nbBins should always be > 0.")
    }

    if (!checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)) {
        throw new Error(`At least one value in ${key} is not a number.`)
    }

    const [min, max] = extent(data.map((d) => d[key] as number))
    const binGenerator = scaleQuantize()
        .domain([min as number, max as number])
        .range(range(1, nbBins + 1))

    for (let i = 0; i < data.length; i++) {
        const value = data[i][key] as number
        const bin = binGenerator(value)
        data[i][newKey] = bin
    }

    return data
}
