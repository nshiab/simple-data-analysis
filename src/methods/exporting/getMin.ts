import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import { min } from "d3-array"

export default function getMin(
    data: SimpleDataItem[],
    key: string
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    if (!checkTypeOfKey(data, key, "number", 0.5)) {
        throw new Error(`${key} values are not numbers mostly.`)
    }

    return min(data, (d) => d[key] as number)
}
