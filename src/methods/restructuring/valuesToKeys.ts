import hasKey from "../../helpers/hasKey.js"
import log from "../../helpers/log.js"
import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types"
import removeDuplicates from "../cleaning/removeDuplicates.js"
import getUniqueValues from "../exporting/getUniqueValues.js"

export default function valuesToKeys(
    data: SimpleDataItem[],
    newKeys: string,
    newValues: string,
    verbose = false
) {
    if (!hasKey(data[0], newKeys)) {
        throw new Error("No key " + newKeys + " in the data")
    }
    if (!hasKey(data[0], newValues)) {
        throw new Error("No key " + newValues + " in the data")
    }

    const keysToKeep = Object.keys(data[0]).filter(
        (d) => ![newKeys, newValues].includes(d)
    )

    const keysToAdd = getUniqueValues(data, newKeys)

    const newData = removeDuplicates(
        data.map((d) => {
            const newItem: { [key: string]: SimpleDataValue } = {}
            for (const key of keysToKeep) {
                newItem[key] = d[key]
            }
            return newItem
        })
    )

    for (let i = 0; i < newData.length; i++) {
        const newItem = newData[i]

        const oldItems = data.filter((d) => {
            let test = true
            for (const key of keysToKeep) {
                if (newItem[key] !== d[key]) {
                    test = false
                    break
                }
            }
            return test
        })

        for (const key of keysToAdd) {
            const oldItem = oldItems.find((d) => d[newKeys] === key)
            newItem[key as string] = oldItem ? oldItem[newValues] : undefined
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
