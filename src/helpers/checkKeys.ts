import { SimpleDataItem } from "../types/SimpleData.types.js"
import isEqual from "lodash.isequal"
import log from "./log.js"

export default function checkKeys(
    data: SimpleDataItem[],
    fillMissingKeys: boolean,
    verbose: boolean
) {
    if (data.length === 0) {
        throw new Error("The data is empty")
    }
    const keys = Object.keys(data[0]).sort()
    for (let i = 1; i < data.length; i++) {
        const currentKeys = Object.keys(data[i]).sort()
        if (!isEqual(keys, currentKeys)) {
            if (fillMissingKeys) {
                const uniquesKeys = [...new Set([...keys, ...currentKeys])]
                for (const key of uniquesKeys) {
                    if (data[i][key] === undefined) {
                        data[i][key] = undefined
                        verbose &&
                            log(
                                `Missing key ${key} for item index ${i}. Adding value as undefined.`
                            )
                    }
                }
            } else {
                throw new Error(
                    `Objects in the array don't have the same keys.\nObject index 0 keys => ${String(
                        keys
                    )}\n${JSON.stringify(
                        data[0]
                    )}\nObject index ${i} keys => ${String(
                        currentKeys
                    )}\n${JSON.stringify(data[i])}`
                )
            }
        }
    }
}
