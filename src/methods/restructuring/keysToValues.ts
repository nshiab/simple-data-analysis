import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types"
import { hasKey, log } from "../../exports/helpers.js"

export default function keysToValues(
    data: SimpleDataItem[],
    keys: string[],
    newKeyForKeys: string,
    newKeyForValues: string,
    verbose = false
) {
    if (newKeyForKeys === undefined) {
        throw new Error("You need to provide a newKeyForKeys")
    }
    if (newKeyForValues === undefined) {
        throw new Error("You need to provide a newKeyForValues")
    }
    hasKey(data, newKeyForKeys, true)
    hasKey(data, newKeyForValues, true)
    for (const key of keys) {
        hasKey(data, key)
    }

    const keysToKeep = Object.keys(data[0]).filter((d) => !keys.includes(d))

    const newData = []

    for (let i = 0; i < data.length; i++) {
        const oldItem = data[i]

        for (const key of keys) {
            const newItem: { [key: string]: SimpleDataValue } = {}

            if (oldItem[key]) {
                for (const keyToKeep of keysToKeep) {
                    newItem[keyToKeep] = oldItem[keyToKeep]
                }

                newItem[newKeyForKeys] = key
                newItem[newKeyForValues] = oldItem[key]

                newData.push(newItem)
            }
        }
    }

    verbose &&
        log(
            `The data received had ${data.length} items, ${
                Object.keys(data[0]).length
            } keys and ${
                data.length * Object.keys(data[0]).length
            } values. The data restructured now has ${newData.length} items, ${
                Object.keys(newData[0]).length
            } keys and ${
                newData.length * Object.keys(newData[0]).length
            } values`
        )

    return newData
}
