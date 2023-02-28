import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function getUniqueValues(
    data: SimpleDataItem[],
    key: string
): SimpleDataValue[] {
    hasKey(data, key)

    const uniques = [...new Set(data.map((d) => d[key]))]

    return uniques
}
