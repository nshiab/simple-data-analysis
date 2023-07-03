import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function modifyItems(
    data: SimpleDataItem[],
    itemGenerator: (
        item: SimpleDataItem,
        idx: number,
        data: SimpleDataItem[]
    ) => SimpleDataItem
): SimpleDataItem[] {
    for (let i = 0; i < data.length; i++) {
        data[i] = itemGenerator(data[i], i, data)
    }

    return data
}
