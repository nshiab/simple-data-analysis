import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function modifyItems(
    data: SimpleDataItem[],
    key: string,
    itemGenerator: (item: SimpleDataItem) => SimpleDataValue
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error(
            "No key named " +
                key +
                ". If you want to create a new one, use addKey."
        )
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = itemGenerator(data[i])
    }

    return data
}
