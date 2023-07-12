import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { hasKey } from "../../exports/helpers.js"

export default function renameKey(
    data: SimpleDataItem[],
    oldKey: string | string[],
    newKey: string | string[]
): SimpleDataItem[] {
    const oldKeys = Array.isArray(oldKey) ? oldKey : [oldKey]
    const newKeys = Array.isArray(newKey) ? newKey : [newKey]

    if (oldKeys.length !== newKeys.length) {
        throw new Error(
            "The same number of keys should be passed to oldKey and newKey."
        )
    }

    for (let i = 0; i < oldKeys.length; i++) {
        const oldKey = oldKeys[i]
        const newKey = newKeys[i]
        hasKey(data, oldKey)
        hasKey(data, newKey, true)

        for (let i = 0; i < data.length; i++) {
            const d = data[i]
            d[newKey] = d[oldKey]
            delete d[oldKey]
        }
    }

    return data
}
