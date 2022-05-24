import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function addKey(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (item: SimpleDataItem) => SimpleDataValue
): SimpleDataItem[] {
    if (hasKey(data[0], key)) {
        throw new Error("Already a key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = valueGenerator(data[i])
    }

    return data
}
