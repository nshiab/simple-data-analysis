import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { min } from "d3-array"
import { hasKey, round, checkTypeOfKey } from "../../exports/helpers.js"

export default function getMin(
    data: SimpleDataItem[],
    key: string,
    nbDigits: undefined | number = undefined,
    nbTestedValues = 10000,
    type: "number" | "Date" = "number",
    verbose = false
): SimpleDataValue {
    hasKey(data, key)
    checkTypeOfKey(data, key, type, 1, nbTestedValues, verbose)

    const result = min(data, (d) => d[key] as number) // and Date too

    if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
