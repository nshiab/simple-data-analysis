import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { quantile as d3Quantile } from "d3-array"
import { hasKey, round, checkTypeOfKey } from "../../exports/helpers.js"

export default function getQuantile(
    data: SimpleDataItem[],
    key: string,
    quantile: number,
    nbDigits = 2,
    nbTestedValues = 10000,
    verbose = false
): SimpleDataValue {
    hasKey(data, key)
    checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)

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
