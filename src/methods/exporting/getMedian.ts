import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { median } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import round from "../../helpers/round.js"

export default function getMedian(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2,
    nbTestedValues = 10000,
    type: "number" | "Date" = "number",
    verbose = false
): SimpleDataValue {
    if (!hasKey(data, key)) {
        throw new Error(`No key ${key} in data`)
    }
    checkTypeOfKey(data, key, type, 1, nbTestedValues, verbose)

    const result = median(data, (d) => d[key] as number) // And date too

    if (type === "Date" && result !== undefined) {
        return new Date(result)
    } else if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
