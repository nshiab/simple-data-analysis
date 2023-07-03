import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { hasKey } from "../../exports/helpers.js"

export default function addKey(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (
        item: SimpleDataItem,
        idx: number,
        data: SimpleDataItem[]
    ) => SimpleDataValue
): SimpleDataItem[] {
    hasKey(data, key, true)

    for (let i = 0; i < data.length; i++) {
        data[i][key] = valueGenerator(data[i], i, data)
    }

    return data
}
