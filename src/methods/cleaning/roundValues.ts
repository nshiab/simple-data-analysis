import { SimpleDataItem } from "../../types/index.js"
import { hasKey } from "../../helpers/index.js"

export default function roundValues(
    data: SimpleDataItem[],
    key: string,
    numDigits: number,
    skipErrors = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]
        if (typeof val !== "number") {
            if (!skipErrors) {
                throw new Error(
                    val +
                        " is not a number. Convert to number first (valuesToInteger() or valuesToFloat()). If you want to ignore values that are not numbers, pass { skipErrors: true }."
                )
            }
        } else {
            data[i][key] = parseFloat(val.toFixed(numDigits))
        }
    }

    return data
}
