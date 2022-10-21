import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import { quantile as d3Quantile } from "d3-array"

export default function getQuantile(
    data: SimpleDataItem[],
    key: string,
    quantile: number,
    nbDigits = 2
): SimpleDataValue {
    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    if (quantile === undefined) {
        throw new Error(
            "You need to specify the quantile parameter (value between 0 and 1)."
        )
    }

    const result = d3Quantile(data, quantile, (d) => d[key] as number) as
        | number
        | Date

    if (result instanceof Date) {
        return result.getTime()
    } else if (typeof result === "number") {
        return parseFloat(result.toFixed(nbDigits))
    } else {
        return result
    }
}
