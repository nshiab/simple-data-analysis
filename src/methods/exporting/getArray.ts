import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { hasKey } from "../../exports/helpers.js"

export default function getArray(
    data: SimpleDataItem[],
    key: string | string[]
): SimpleDataValue[] {
    let keys
    if (typeof key === "string") {
        hasKey(data, key)
        keys = [key]
    } else {
        for (const k of key) {
            hasKey(data, k)
        }
        keys = key
    }

    const array = []

    for (let i = 0; i < data.length; i++) {
        for (const key of keys) {
            array.push(data[i][key])
        }
    }

    return array
}
