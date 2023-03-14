import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { sampleCorrelation, combinations } from "simple-statistics"
import { hasKey, checkTypeOfKey, round, log } from "../../exports/helpers.js"
import { getUniqueValues } from "../../exports/exporting.js"

export default function correlation(
    data: SimpleDataItem[],
    keyX?: string,
    keyY?: string | string[],
    keyCategory?: string,
    nbDigits = 4,
    verbose = false,
    nbTestedValues = 10000
): SimpleDataItem[] {
    if (keyCategory === undefined) {
        verbose && log("No keyCategory provided. Data won't be grouped.")
    } else if (typeof keyCategory === "string") {
        hasKey(data, keyCategory)
    } else {
        throw new Error("keyCategory must be a string")
    }

    const correlations: { [key: string]: string | number }[] = []

    if (
        keyX === undefined &&
        (keyY === undefined || (Array.isArray(keyY) && keyY.length === 0))
    ) {
        const keys = Object.keys(data[0]).filter((d) =>
            checkTypeOfKey(data, d, "number", 1, nbTestedValues, verbose, true)
        )
        const combi = combinations(keys, 2)

        for (const c of combi) {
            correlations.push({
                keyX: c[0],
                keyY: c[1],
            })
        }
    } else if (typeof keyX === "string" && Array.isArray(keyY)) {
        hasKey(data, keyX)
        checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)

        for (const key of keyY) {
            hasKey(data, key)
            checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)
            correlations.push({
                keyX: keyX,
                keyY: key,
            })
        }
    } else if (typeof keyX === "string" && typeof keyY === "string") {
        hasKey(data, keyX)
        checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)
        hasKey(data, keyY)
        checkTypeOfKey(data, keyY, "number", 1, nbTestedValues, verbose)
        correlations.push({
            keyX: keyX,
            keyY: keyY,
        })
    } else {
        throw new Error(
            "keyX should be a string and keyY should be a string or array of strings"
        )
    }

    const correlationData: SimpleDataItem[] = []

    if (typeof keyCategory === "string") {
        const categories = getUniqueValues(data, keyCategory)

        for (const category of categories) {
            for (const corr of correlations) {
                const x = data
                    .filter((d) => d[keyCategory] === category)
                    .map((d) => d[corr.keyX])
                const y = data
                    .filter((d) => d[keyCategory] === category)
                    .map((d) => d[corr.keyY])

                if (
                    typeof category !== "string" &&
                    typeof category !== "number"
                ) {
                    throw new Error(
                        `Values of ${keyCategory} must be strings or numbers.`
                    )
                }
                corr[keyCategory] = category

                computeCorr(x, y, corr, correlationData, nbDigits)
            }
        }
    } else {
        for (const corr of correlations) {
            const x = data.map((d) => d[corr.keyX])
            const y = data.map((d) => d[corr.keyY])
            computeCorr(x, y, corr, correlationData, nbDigits)
        }
    }

    return correlationData
}

function computeCorr(
    x: SimpleDataValue[],
    y: SimpleDataValue[],
    corr: {
        [key: string]: string | number
    },
    correlationData: SimpleDataItem[],
    nbDigits: number
) {
    const result = sampleCorrelation(x as number[], y as number[])

    correlationData.push({
        ...corr,
        correlation: Number.isNaN(result) ? NaN : round(result, nbDigits),
    })
}
