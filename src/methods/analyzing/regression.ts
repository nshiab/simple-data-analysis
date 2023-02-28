// using https://observablehq.com/@harrystevens/introducing-d3-regression
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { combinations } from "simple-statistics"
import {
    regressionLinear,
    regressionQuad,
    regressionPoly,
    regressionExp,
    regressionLog,
    regressionPow,
} from "d3-regression"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import hasKey from "../../helpers/hasKey.js"
import round from "../../helpers/round.js"
import log from "../../helpers/log.js"
import getUniqueValues from "../exporting/getUniqueValues.js"

export default function regression(
    data: SimpleDataItem[],
    keyX?: string,
    keyY?: string | string[],
    type:
        | "linear"
        | "quadratic"
        | "polynomial"
        | "exponential"
        | "logarithmic"
        | "power" = "linear",
    keyCategory?: string,
    order?: number,
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

    const linearRegressions: { [key: string]: string | number }[] = []

    if (verbose) {
        log(`regression type = ${type}`, "blue")
    }

    if (
        keyX === undefined &&
        (keyY === undefined || (Array.isArray(keyY) && keyY.length === 0))
    ) {
        const keys = Object.keys(data[0]).filter((d) =>
            checkTypeOfKey(data, d, "number", 1, nbTestedValues, verbose, true)
        )
        const combi = combinations(keys, 2)

        for (const c of combi) {
            linearRegressions.push({
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
            linearRegressions.push({
                keyX: keyX,
                keyY: key,
            })
        }
    } else if (typeof keyX === "string" && typeof keyY === "string") {
        hasKey(data, keyX)
        checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)
        hasKey(data, keyY)
        checkTypeOfKey(data, keyY, "number", 1, nbTestedValues, verbose)
        linearRegressions.push({
            keyX: keyX,
            keyY: keyY,
        })
    } else {
        throw new Error(
            "keyX should be a string and keyY should be a string or array of strings"
        )
    }

    const linearRegressionData: SimpleDataItem[] = []

    if (keyCategory) {
        const categories = getUniqueValues(data, keyCategory)

        for (const category of categories) {
            for (const lr of linearRegressions) {
                if (
                    typeof category !== "string" &&
                    typeof category !== "number"
                ) {
                    throw new Error(
                        `Values of ${keyCategory} must be strings or numbers.`
                    )
                }
                lr[keyCategory] = category
                computeRegr(
                    data.filter((d) => d[keyCategory] === category),
                    linearRegressionData,
                    lr,
                    type,
                    order,
                    nbDigits
                )
            }
        }
    } else {
        for (const lr of linearRegressions) {
            computeRegr(data, linearRegressionData, lr, type, order, nbDigits)
        }
    }

    return linearRegressionData
}

function computeRegr(
    data: SimpleDataItem[],
    linearRegressionData: SimpleDataItem[],
    lr: { [key: string]: string | number },
    type:
        | "linear"
        | "quadratic"
        | "polynomial"
        | "exponential"
        | "logarithmic"
        | "power",
    order: number | undefined,
    nbDigits: number
) {
    const coefs = "abcdefghijk"

    let compute

    if (type === "linear") {
        compute = new regressionLinear()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
    } else if (type === "quadratic") {
        compute = new regressionQuad()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
    } else if (type === "polynomial") {
        if (order === undefined) {
            throw new Error(
                "With a polynomial regression, you must specify an order."
            )
        }
        if (order > coefs.length - 1) {
            throw new Error(`Max value for order is ${coefs.length - 1}`)
        }
        compute = new regressionPoly()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
            .order(order)
    } else if (type === "exponential") {
        compute = new regressionExp()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
    } else if (type === "logarithmic") {
        compute = new regressionLog()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
    } else if (type === "power") {
        compute = new regressionPow()
            .x((d: SimpleDataItem) => d[lr.keyX])
            .y((d: SimpleDataItem) => d[lr.keyY])
            .domain([0, 0])
    } else {
        throw new Error(`Unknown regression type ${type}.`)
    }

    const result = compute(data)

    if (result.coefficients) {
        result.coefficients.reverse()
        for (let i = 0; i < result.coefficients.length; i++) {
            if (typeof result.coefficients[i] === "number") {
                lr[coefs[i]] = round(result.coefficients[i], nbDigits)
            }
        }
    } else {
        for (const prop of coefs) {
            if (typeof result[prop] === "number") {
                lr[prop] = round(result[prop], nbDigits)
            }
        }
    }

    if (result.rSquared) {
        lr.r2 = round(result.rSquared, nbDigits)
    }

    linearRegressionData.push({
        ...lr,
    })
}
