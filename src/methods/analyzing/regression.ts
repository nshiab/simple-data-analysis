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
    regressionLoess,
} from "d3-regression"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import hasKey from "../../helpers/hasKey.js"
import round from "../../helpers/round.js"
import log from "../../helpers/log.js"

export default function regression(
    data: SimpleDataItem[],
    key1?: string,
    key2?: string | string[],
    type:
        | "linear"
        | "quadratic"
        | "polynomial"
        | "exponential"
        | "logarithmic"
        | "power"
        | "loess" = "linear",
    order?: number,
    bandwidth?: number,
    nbDigits = 4,
    verbose = false,
    nbTestedValues = 10000
): SimpleDataItem[] {
    const linearRegressions = []

    if (verbose) {
        log(`type = ${type}`, "blue")
    }

    if (
        key1 === undefined &&
        (key2 === undefined || (Array.isArray(key2) && key2.length === 0))
    ) {
        const keys = Object.keys(data[0]).filter((d) =>
            checkTypeOfKey(data, d, "number", 1, nbTestedValues, verbose)
        )
        const combi = combinations(keys, 2)

        for (const c of combi) {
            linearRegressions.push({
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
            linearRegressions.push({
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
        linearRegressions.push({
            key1: key1,
            key2: key2,
        })
    } else {
        throw new Error(
            "key1 should be a string and key2 should be a string or array of strings"
        )
    }

    const linearRegressionData: SimpleDataItem[] = []

    const coefs = "abcdefghijk"

    for (const lr of linearRegressions) {
        let compute

        if (type === "linear") {
            compute = new regressionLinear()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .domain([0, 0])
        } else if (type === "quadratic") {
            compute = new regressionQuad()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
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
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .domain([0, 0])
                .order(order)
        } else if (type === "exponential") {
            compute = new regressionExp()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .domain([0, 0])
        } else if (type === "logarithmic") {
            compute = new regressionLog()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .domain([0, 0])
        } else if (type === "power") {
            compute = new regressionPow()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .domain([0, 0])
        } else if (type === "loess") {
            if (bandwidth === undefined) {
                throw new Error(
                    "With loess regression, you must specify a bandwidth."
                )
            }
            if (bandwidth > 1 || bandwidth < 0) {
                throw new Error(
                    "With loess regression, you must specify a bandwidth between 0 and 1."
                )
            }
            compute = new regressionLoess()
                .x((d: SimpleDataItem) => d[lr.key1])
                .y((d: SimpleDataItem) => d[lr.key2])
                .bandwidth(bandwidth)
        } else {
            throw new Error(`Unknown regression type ${type}.`)
        }

        const result = compute(data)

        const obj: { [key: string]: number } = {}

        if (result.coefficients) {
            result.coefficients.reverse()
            for (let i = 0; i < result.coefficients.length; i++) {
                if (typeof result.coefficients[i] === "number") {
                    obj[coefs[i]] = round(result.coefficients[i], nbDigits)
                }
            }
        } else {
            for (const prop of coefs) {
                if (typeof result[prop] === "number") {
                    obj[prop] = round(result[prop], nbDigits)
                }
            }
        }

        if (result.rSquared) {
            obj.r2 = round(result.rSquared, nbDigits)
        }

        linearRegressionData.push({
            ...lr,
            ...obj,
        })
    }

    return linearRegressionData
}
