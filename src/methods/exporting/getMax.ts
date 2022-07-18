import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import { max } from "d3-array"

export default function getMax(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    if (!checkTypeOfKey(data, key, "number", 0.5)) {
        throw new Error(`The majority of values inside ${key} are not numbers.`)
    }

    const result = max(data, (d) => d[key] as number)

    return result ? parseFloat(result.toFixed(nbDigits)) : result
}
