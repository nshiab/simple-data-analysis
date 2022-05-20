import { SimpleDataItem } from "../types/SimpleData.types.js"
import isEqual from "lodash.isequal"

export default function checkKeys(data: SimpleDataItem[]) {
    if (data.length === 0) {
        throw new Error("The data is empty")
    }
    const keys = Object.keys(data[0]).sort()
    for (let i = 1; i < data.length; i++) {
        const currentKeys = Object.keys(data[i]).sort()
        if (!isEqual(keys, currentKeys)) {
            throw new Error(
                `Objects in the array don't have the same keys.\nObject index 0 keys => ${String(
                    keys
                )}\nObject index ${i} keys => ${String(currentKeys)}`
            )
        }
    }
}
