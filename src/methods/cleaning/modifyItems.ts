import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { getKeyToUpdate } from "../../exports/helpers.js"

export default function modifyItems(
    data: SimpleDataItem[],
    key: string,
    itemGenerator: (
        item: SimpleDataItem,
        idx: number,
        data: SimpleDataItem[]
    ) => SimpleDataValue,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = itemGenerator(data[i], i, data)
    }

    return data
}
