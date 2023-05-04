import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { mean } from "d3-array"
import { hasKey, round, checkTypeOfKey } from "../../exports/helpers.js"

export default function getMean(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2,
    nbTestedValues = 10000,
    type: "number" | "Date" = "number",
    verbose = false
): SimpleDataValue {
    hasKey(data, key)
    checkTypeOfKey(data, key, type, 1, nbTestedValues, verbose)

    const result = mean(data, (d) => d[key] as number) // and Date too

    if (type === "Date" && result !== undefined) {
        return new Date(result)
    } else if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
