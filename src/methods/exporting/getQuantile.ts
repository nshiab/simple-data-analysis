import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { quantile as d3Quantile } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import round from "../../helpers/round.js"

export default function getQuantile(
    data: SimpleDataItem[],
    key: string,
    quantile: number,
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

    if (quantile === undefined) {
        throw new Error(
            "You need to specify the quantile parameter (value between 0 and 1)."
        )
    }

    const result = d3Quantile(data, quantile, (d) => d[key] as number)

    if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
