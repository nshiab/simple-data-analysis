import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function modifyItems(
    data: SimpleDataItem[],
    key: string,
    itemGenerator: (item: SimpleDataItem) => SimpleDataValue,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = itemGenerator(data[i])
    }

    return data
}
