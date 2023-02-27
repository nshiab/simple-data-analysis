import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { min } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import round from "../../helpers/round.js"

export default function getMin(
    data: SimpleDataItem[],
    key: string,
    nbDigits: undefined | number = undefined,
    nbTestedValues = 10000,
    type: "number" | "Date" = "number",
    verbose = false
): SimpleDataValue {
    if (!hasKey(data, key)) {
        throw new Error(`No key ${key} in data`)
    }
    checkTypeOfKey(data, key, type, 1, nbTestedValues, verbose)

    const result = min(data, (d) => d[key] as number) // and Date too

    if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
