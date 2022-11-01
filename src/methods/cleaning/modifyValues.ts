import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function modifyValues(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (val: SimpleDataValue) => SimpleDataValue,
    newKey?: string
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    if (newKey && hasKey(data[0], newKey)) {
        throw new Error(newKey + " already exists")
    }

    const keyToUpdate = newKey ? newKey : key

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = valueGenerator(data[i][key])
    }

    return data
}
