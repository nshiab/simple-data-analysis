import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { max } from "d3-array"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import round from "../../helpers/round.js"

export default function getMax(
    data: SimpleDataItem[],
    key: string,
    nbDigits: number | undefined = undefined,
    nbTestedValues = 10000,
    type: "number" | "Date" = "number",
    verbose = false
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }
    if (!checkTypeOfKey(data, key, type, 1, nbTestedValues, verbose)) {
        throw new Error(`At least one value in ${key} is not a ${type}.`)
    }

    const result = max(data, (d) => d[key] as number | Date)

    if (typeof result === "number") {
        return round(result, nbDigits)
    } else {
        return result
    }
}
