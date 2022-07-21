import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"
import cleaning from "../cleaning/index.js"
import exporting from "../exporting/index.js"

export default function valuesToKeys(
    data: SimpleDataItem[],
    newKeys: string,
    newValues: string,
    verbose = false
) {
    if (!helpers.hasKey(data[0], newKeys)) {
        throw new Error("No key " + newKeys + " in the data")
    }
    if (!helpers.hasKey(data[0], newValues)) {
        throw new Error("No key " + newValues + " in the data")
    }

    const keysToKeep = Object.keys(data[0]).filter(
        (d) => ![newKeys, newValues].includes(d)
    )

    const keysToAdd = exporting.getUniqueValues_(data, newKeys)

    const newData = cleaning.removeDuplicates_(
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
        helpers.log(
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
