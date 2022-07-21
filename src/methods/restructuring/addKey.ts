import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function addKey(
    data: SimpleDataItem[],
    key: string,
    itemGenerator: (item: SimpleDataItem) => SimpleDataValue
): SimpleDataItem[] {
    if (helpers.hasKey(data[0], key)) {
        throw new Error("Already a key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = itemGenerator(data[i])
    }

    return data
}
