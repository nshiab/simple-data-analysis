import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { sampleCorrelation, combinations } from "simple-statistics"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import hasKey from "../../helpers/hasKey.js"
import round from "../../helpers/round.js"
import log from "../../helpers/log.js"
import getUniqueValues from "../exporting/getUniqueValues.js"

export default function correlation(
    data: SimpleDataItem[],
    keyX?: string,
    keyY?: string | string[],
    keyCategory?: string,
    nbDigits = 4,
    verbose = false,
    nbTestedValues = 10000
): SimpleDataItem[] {
    const correlations = []

    if (keyCategory === undefined) {
        verbose && log("No keyCategory provided. Data won't be grouped.")
    } else if (typeof keyCategory === "string") {
        if (!hasKey(data, keyCategory)) {
            throw new Error("No keyCategory " + keyCategory)
        }
        if (
            !checkTypeOfKey(
                data,
                keyCategory,
                "string",
                1,
                nbTestedValues,
                verbose
            )
        ) {
            throw new Error(`Values in ${keyCategory} must be strings.`)
        }
    } else {
        throw new Error(
            "keyCategory must be either a string or an array of string"
        )
    }

    if (
        keyX === undefined &&
        (keyY === undefined || (Array.isArray(keyY) && keyY.length === 0))
    ) {
        const keys = Object.keys(data[0]).filter((d) =>
            checkTypeOfKey(data, d, "number", 1, nbTestedValues, verbose)
        )
        const combi = combinations(keys, 2)

        for (const c of combi) {
            correlations.push({
                keyX: c[0],
                keyY: c[1],
            })
        }
    } else if (typeof keyX === "string" && Array.isArray(keyY)) {
        if (!hasKey(data, keyX)) {
            throw new Error(`No key ${keyX} in data`)
        }
        if (!checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyX} is not a number.`)
        }

        for (const key of keyY) {
            if (!hasKey(data, key)) {
                throw new Error(`No key ${key} in data`)
            }
            if (
                !checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)
            ) {
                throw new Error(`At least one value in ${key} is not a number.`)
            }
            correlations.push({
                keyX: keyX,
                keyY: key,
            })
        }
    } else if (typeof keyX === "string" && typeof keyY === "string") {
        if (!hasKey(data, keyX)) {
            throw new Error(`No key ${keyX} in data`)
        }
        if (!checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyX} is not a number.`)
        }
        if (!hasKey(data, keyY)) {
            throw new Error(`No key ${keyY} in data`)
        }
        if (!checkTypeOfKey(data, keyY, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyY} is not a number.`)
        }
        correlations.push({
            keyX: keyX,
            keyY: keyY,
        })
    } else {
        throw new Error(
            "keyX should be a string and keyY should be a string or array of strings"
        )
    }

    const correlationData = []

    if (keyCategory) {
        const categories = getUniqueValues(data, keyCategory)

        for (const category of categories) {
            for (const corr of correlations) {
                const x = data
                    .filter((d) => d[keyCategory] === category)
                    .map((d) => d[corr.keyX])
                const y = data
                    .filter((d) => d[keyCategory] === category)
                    .map((d) => d[corr.keyY])

                const result = sampleCorrelation(x as number[], y as number[])

                const obj: { [key: string]: SimpleDataValue } = {}
                obj[keyCategory] = category

                correlationData.push({
                    ...obj,
                    ...corr,
                    correlation: Number.isNaN(result)
                        ? NaN
                        : round(result, nbDigits),
                })
            }
        }
    } else {
        for (const corr of correlations) {
            const x = data.map((d) => d[corr.keyX])
            const y = data.map((d) => d[corr.keyY])

            const result = sampleCorrelation(x as number[], y as number[])

            correlationData.push({
                ...corr,
                correlation: Number.isNaN(result)
                    ? NaN
                    : round(result, nbDigits),
            })
        }
    }

    return correlationData
}
