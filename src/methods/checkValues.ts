import { SimpleDataItem } from "../types/SimpleData.types.js"
import getArray from "./getArray.js"
import percentage from "../helpers/percentage.js"
import hasKey from "../helpers/hasKey.js"

export default function checkValues(data: SimpleDataItem[]): SimpleDataItem[] {
    const keys: string[] = Object.keys(data[0])

    const allChecks: SimpleDataItem[] = []

    for (const key of keys) {
        const checks: any = {}
        checks["key"] = key

        const array = getArray(data, key)

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

        for (let i = 0; i < array.length; i++) {
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

            if (!hasKey(checks, typeOf)) {
                checks[typeOf] = 1
            } else {
                checks[typeOf] += 1
            }
        }

        for (const key of Object.keys(checks)) {
            if (key !== "key" && key != "count" && checks[key] !== 0) {
                checks[key] = [
                    checks[key],
                    percentage(checks[key], checks.count),
                ]
            }
        }

        allChecks.push(checks)
    }

    return allChecks
}
