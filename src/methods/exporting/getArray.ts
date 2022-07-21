import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import { hasKey } from "../../helpers/index.js"

export default function getArray(
    data: SimpleDataItem[],
    key: string
): SimpleDataValue[] {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    const array = data.map((d) => d[key])

    return array
}
