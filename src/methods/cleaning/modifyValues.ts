import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function modifyValues(
    data: SimpleDataItem[],
    key: string,
    valueGenerator: (val: SimpleDataValue) => SimpleDataValue,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

    for (let i = 0; i < data.length; i++) {
        data[i][keyToUpdate] = valueGenerator(data[i][key])
    }

    return data
}
