import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function getUniqueValues(
    data: SimpleDataItem[],
    key: string
): SimpleDataValue[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    const uniques = [...new Set(data.map((d) => d[key]))]

    return uniques
}
