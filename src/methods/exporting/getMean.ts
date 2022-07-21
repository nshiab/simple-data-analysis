import { mean } from "d3-array"

import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import { hasKey, checkTypeOfKey } from "../../helpers/index.js"

export default function getMean(
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

    const result = mean(data, (d) => d[key] as number)

    return result ? parseFloat(result.toFixed(nbDigits)) : result
}
