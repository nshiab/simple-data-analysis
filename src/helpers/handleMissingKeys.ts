import { SimpleDataItem } from "../types/SimpleData.types.js"
import isEqual from "lodash.isequal"
import log from "./log.js"
import getUniqueKeys from "./getUniqueKeys.js"

export default function handleMissingKeys(
    data: SimpleDataItem[],
    fillMissingKeys = false,
    uniqueKeys?: string[],
    verbose?: boolean
) {
    if (uniqueKeys === undefined) {
        uniqueKeys = getUniqueKeys(data)
    }

    for (let i = 0; i < data.length; i++) {
        const currentKeys = Object.keys(data[i]).sort()
        if (isEqual(uniqueKeys, currentKeys)) {
            continue
        }

        if (!fillMissingKeys) {
            throw new Error(
                `Objects in the array don't have the same keys.\nObject index 0 keys => ${String(
                    uniqueKeys
                )}\nObject index ${i} keys => ${String(
                    currentKeys
                )}\n${JSON.stringify(data[i])}`
            )
        }

        const missingKeys = uniqueKeys.filter((k) => !currentKeys.includes(k))
        for (const key of missingKeys) {
            data[i][key] = undefined
            verbose &&
                log(
                    `Missing key ${key} for item index ${i}. Adding value as undefined.`
                )
        }
    }

    return data
}
