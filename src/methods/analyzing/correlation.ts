import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { sampleCorrelation, combinations } from "simple-statistics"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import hasKey from "../../helpers/hasKey.js"
import round from "../../helpers/round.js"

export default function correlation(
    data: SimpleDataItem[],
    key1?: string,
    key2?: string | string[],
    verbose = false,
    nbTestedValues = 10000
): SimpleDataItem[] {
    const correlations = []

    if (
        key1 === undefined &&
        (key2 === undefined || (Array.isArray(key2) && key2.length === 0))
    ) {
        const keys = Object.keys(data[0]).filter((d) =>
            checkTypeOfKey(data, d, "number", 1, nbTestedValues, verbose)
        )
        const combi = combinations(keys, 2)

        for (const c of combi) {
            correlations.push({
                key1: c[0],
                key2: c[1],
            })
        }
    } else if (typeof key1 === "string" && Array.isArray(key2)) {
        if (!hasKey(data[0], key1)) {
            throw new Error(`No key ${key1} in data`)
        }
        if (!checkTypeOfKey(data, key1, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${key1} is not a number.`)
        }

        for (const key of key2) {
            if (!hasKey(data[0], key)) {
                throw new Error(`No key ${key} in data`)
            }
            if (
                !checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)
            ) {
                throw new Error(`At least one value in ${key} is not a number.`)
            }
            correlations.push({
                key1: key1,
                key2: key,
            })
        }
    } else if (typeof key1 === "string" && typeof key2 === "string") {
        if (!hasKey(data[0], key1)) {
            throw new Error(`No key ${key1} in data`)
        }
        if (!checkTypeOfKey(data, key1, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${key1} is not a number.`)
        }
        if (!hasKey(data[0], key2)) {
            throw new Error(`No key ${key2} in data`)
        }
        if (!checkTypeOfKey(data, key2, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${key2} is not a number.`)
        }
        correlations.push({
            key1: key1,
            key2: key2,
        })
    } else {
        throw new Error(
            "key1 should be a string and key2 should be a string or array of strings"
        )
    }

    const correlationData = []

    for (const corr of correlations) {
        const x = data.map((d) => d[corr.key1])
        const y = data.map((d) => d[corr.key2])

        const result = sampleCorrelation(x as number[], y as number[])

        correlationData.push({
            ...corr,
            correlation: Number.isNaN(result) ? NaN : round(result, 4),
        })
    }

    return correlationData
}
