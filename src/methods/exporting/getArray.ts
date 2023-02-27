import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function getArray(
    data: SimpleDataItem[],
    key: string | string[]
): SimpleDataValue[] {
    let keys
    if (typeof key === "string") {
        if (!hasKey(data, key)) {
            throw new Error(`No key ${key} in data`)
        }
        keys = [key]
    } else {
        for (const k of key) {
            if (!hasKey(data, k)) {
                throw new Error(`No key ${key} in data`)
            }
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
