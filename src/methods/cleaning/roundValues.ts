import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import round from "../../helpers/round.js"

export default function roundValues(
    data: SimpleDataItem[],
    key: string,
    numDigits: number,
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (newKey && hasKey(data[0], newKey)) {
        throw new Error(newKey + " already exists")
    }

    const keyToUpdate = newKey ? newKey : key

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
            data[i][keyToUpdate] = round(val, numDigits)
        }
    }

    return data
}
