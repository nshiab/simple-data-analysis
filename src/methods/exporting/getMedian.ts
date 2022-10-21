import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { median } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"

export default function getMedian(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2,
    nbTestedValues = 10000,
    verbose = false
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }
    if (!checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)) {
        throw new Error(`At least one value in ${key} is not a number.`)
    }

    const result = median(data, (d) => d[key] as number) as number

    if (typeof result === "number") {
        return parseFloat(result.toFixed(nbDigits))
    } else {
        return result
    }
}
