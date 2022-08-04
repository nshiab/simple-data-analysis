import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { median } from "d3-array"

export default function getMedian(
    data: SimpleDataItem[],
    key: string,
    nbDigits = 2
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    const result = median(data, (d) => d[key] as number) as number | Date

    if (result instanceof Date) {
        return result.getTime()
    } else if (typeof result === "number") {
        return parseFloat(result.toFixed(nbDigits))
    } else {
        return result
    }
}
