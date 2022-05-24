import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function modifyValues(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (val: SimpleDataValue) => SimpleDataValue
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = valueGenerator(data[i][key])
    }

    return data
}
