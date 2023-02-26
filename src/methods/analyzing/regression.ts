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
    order?: number,
    nbDigits = 4,
    verbose = false,
    nbTestedValues = 10000
): SimpleDataItem[] {
    const linearRegressions = []

    if (verbose) {
        log(`type = ${type}`, "blue")
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
            linearRegressions.push({
                keyX: c[0],
                keyY: c[1],
            })
        }
    } else if (typeof keyX === "string" && Array.isArray(keyY)) {
        if (!hasKey(data[0], keyX)) {
            throw new Error(`No key ${keyX} in data`)
        }
        if (!checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyX} is not a number.`)
        }

        for (const key of keyY) {
            if (!hasKey(data[0], key)) {
                throw new Error(`No key ${key} in data`)
            }
            if (
                !checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)
            ) {
                throw new Error(`At least one value in ${key} is not a number.`)
            }
            linearRegressions.push({
                keyX: keyX,
                keyY: key,
            })
        }
    } else if (typeof keyX === "string" && typeof keyY === "string") {
        if (!hasKey(data[0], keyX)) {
            throw new Error(`No key ${keyX} in data`)
        }
        if (!checkTypeOfKey(data, keyX, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyX} is not a number.`)
        }
        if (!hasKey(data[0], keyY)) {
            throw new Error(`No key ${keyY} in data`)
        }
        if (!checkTypeOfKey(data, keyY, "number", 1, nbTestedValues, verbose)) {
            throw new Error(`At least one value in ${keyY} is not a number.`)
        }
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

    const coefs = "abcdefghijk"

    for (const lr of linearRegressions) {
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
