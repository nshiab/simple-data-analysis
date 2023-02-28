import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import { sum } from "d3-array"
import round from "../../helpers/round.js"

export default function getSum(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2,
    nbTestedValues = 10000,
    verbose = false
): SimpleDataValue {
    hasKey(data, key)
    checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)

    const result = sum(data, (d) => d[key] as number)

    return result ? round(result, nbDigits) : result
}
