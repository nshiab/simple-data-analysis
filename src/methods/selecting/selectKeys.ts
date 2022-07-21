import { SimpleDataItem } from "../../types/index.js"
import { hasKey } from "../../helpers/index.js"

export default function selectKeys(
    data: SimpleDataItem[],
    keys: string[]
): SimpleDataItem[] {
    for (const key of keys) {
        if (!hasKey(data[0], key)) {
            throw new Error("No key " + key)
        }
    }

    const selectedData = []

    for (let i = 0; i < data.length; i++) {
        const obj: SimpleDataItem = {}
        for (const key of keys) {
            obj[key] = data[i][key]
        }
        selectedData.push(obj)
    }

    return selectedData
}
