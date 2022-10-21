import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { ascending, descending, Primitive } from "d3-array"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"

export default function sortValues(
    data: SimpleDataItem[],
    key: string | string[],
    order: "ascending" | "descending",
    locale = "fr",
    nbTestedValue = 10000
): SimpleDataItem[] {
    let keysToSort
    if (typeof key === "string") {
        keysToSort = [key]
    } else if (Array.isArray(key)) {
        keysToSort = key
    } else {
        throw new Error("key must be a string or an array of strings.")
    }

    for (const key of keysToSort) {
        if (!hasKey(data[0], key)) {
            throw new Error("No key " + key)
        }
    }

    if (!["ascending", "descending"].includes(order)) {
        throw new Error(order + " must be ascending or descending.")
    }

    if (order === "ascending") {
        for (let i = keysToSort.length - 1; i >= 0; i--) {
            const key = keysToSort[i]
            if (checkTypeOfKey(data, key, "string", 0.5, nbTestedValue)) {
                data.sort((a, b) =>
                    (a[key] as string).localeCompare(b[key] as string, locale)
                )
            } else {
                data.sort((a, b) =>
                    ascending(a[key] as Primitive, b[key] as Primitive)
                )
            }
        }
    } else {
        for (let i = keysToSort.length - 1; i >= 0; i--) {
            const key = keysToSort[i]
            if (checkTypeOfKey(data, key, "string", 0.5, nbTestedValue)) {
                data.sort((a, b) =>
                    (b[key] as string).localeCompare(a[key] as string, locale)
                )
            } else {
                data.sort((a, b) =>
                    descending(a[key] as Primitive, b[key] as Primitive)
                )
            }
        }
    }

    return data
}
