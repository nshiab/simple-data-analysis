import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function modifyValues(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (val: SimpleDataValue) => SimpleDataValue
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = valueGenerator(data[i][key])
    }

    return data
}
