import { shuffle } from "d3-array"

import { SimpleDataItem } from "../../types/index.js"
import exporting from "../exporting/index.js"
import helpers from "../../helpers/index.js"

export default function checkValues(
    data: SimpleDataItem[],
    nbItemsToCheck: "all" | number = "all",
    randomize = false
): SimpleDataItem[] {
    const keys: string[] = Object.keys(data[0])

    const allChecks: SimpleDataItem[] = []

    if (nbItemsToCheck !== "all" && typeof nbItemsToCheck !== "number") {
        throw new Error("nbItemsToCheck needs to be either 'all' or a number.")
    }

    if (data.length > 100000 && nbItemsToCheck === "all") {
        throw new Error(
            `By default, the option nbItemsToCheck is set to "all". But the number of items in the data (${data.length}) is greater than 100000. Specify the number of items you want to check like this {nbItemsToCheck: 1000000} (the bigger, the longer to compute) and the *first* X items will be checked. If you want to randomize the order of your data to check X *random* items, add {randomize: true}.`
        )
    }

    const maxCheck =
        nbItemsToCheck === "all"
            ? data.length
            : Math.min(nbItemsToCheck, data.length)

    const dataToCheck = randomize
        ? shuffle(data).slice(0, maxCheck)
        : data.slice(0, maxCheck)

    for (const key of keys) {
        const checks: { [key: string]: string | number } = {}
        checks["key"] = key

        const array = exporting.getArray_(dataToCheck, key)

        checks["count"] = array.length

        const uniques = array.filter((d, i) => array.indexOf(d) === i)
        // because NaN is ignored in the line above. And we need to pass it as a string otherwise it will be ignored again.
        if (array.includes(NaN)) {
            uniques.push("NaN")
        }
        checks["uniques"] = uniques.length

        // We declare them first so they are positionned before the others types.
        checks["string"] = 0
        checks["number"] = 0

        for (let i = 0; i < maxCheck; i++) {
            let typeOf

            if (array[i] === undefined) {
                typeOf = "undefined"
            } else if (array[i] === null) {
                typeOf = "null"
            } else if (Number.isNaN(array[i])) {
                typeOf = "NaN"
            } else {
                typeOf = typeof array[i]
            }

            if (!helpers.hasKey(checks, typeOf)) {
                checks[typeOf] = 1
            } else {
                ;(checks[typeOf] as number) += 1
            }
        }

        for (const key of Object.keys(checks)) {
            if (key !== "key" && key != "count" && checks[key] !== 0) {
                checks[key] = `${checks[key]} | ${helpers.toPercentage(
                    checks[key] as number,
                    checks.count,
                    0
                )}`
            }
        }

        allChecks.push(checks)
    }

    return allChecks
}
