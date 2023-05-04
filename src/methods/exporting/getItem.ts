import { SimpleDataItem } from "../../types/SimpleData.types"
import { hasKey } from "../../exports/helpers.js"

export default function getItem(
    data: SimpleDataItem[],
    conditions: SimpleDataItem,
    noWarning = false
): SimpleDataItem | undefined {
    if (
        typeof conditions !== "object" ||
        Array.isArray(conditions) ||
        conditions === null
    ) {
        throw new Error(
            "The conditions parameter must be an object, like so {key1: value1, key2: value2}"
        )
    }

    const keys = Object.keys(conditions)

    if (keys.length === 0) {
        throw new Error(
            "No conditions provided. You need to give conditions in an object, like so {key1: value1, key2: value2}"
        )
    }

    for (const key of keys) {
        hasKey(data, key)
    }

    const values = Object.values(conditions)

    const items = data.filter((d) => {
        let test = true
        for (let i = 0; i < keys.length; i++) {
            if (d[keys[i]] !== values[i]) {
                test = false
                break
            }
        }
        return test
    })

    const item = items[0]

    if (!noWarning && item === undefined) {
        console.log(
            `WARNING: no item matching your conditions ${JSON.stringify(
                conditions,
                null,
                " "
            )}. Returning undefined. (To remove this warning, set noWarning to true.)`
        )
    }
    if (!noWarning && items.length > 1) {
        console.log(
            `WARNING: Several items matching your conditions ${JSON.stringify(
                conditions,
                null,
                " "
            )}. Only the first one found is returned. (To remove this warning, set noWarning to true.)`
        )
    }

    return item
}
