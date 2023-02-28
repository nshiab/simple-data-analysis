import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function addKey(
    data: SimpleDataItem[],
    key: string,
    itemGenerator: (item: SimpleDataItem) => SimpleDataValue
): SimpleDataItem[] {
    hasKey(data, key, true)

    for (let i = 0; i < data.length; i++) {
        data[i][key] = itemGenerator(data[i])
    }

    return data
}
