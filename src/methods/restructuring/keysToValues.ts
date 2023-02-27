import hasKey from "../../helpers/hasKey.js"
import log from "../../helpers/log.js"
import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types"

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
    if (hasKey(data, newKeyForKeys)) {
        throw new Error("Already a key named " + newKeyForKeys)
    }
    if (hasKey(data, newKeyForValues)) {
        throw new Error("Already a key named " + newKeyForValues)
    }
    for (const key of keys) {
        if (!hasKey(data, key)) {
            throw new Error("No key " + key + " in the data")
        }
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
