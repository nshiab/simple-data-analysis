import { SimpleDataItem } from "../../types/SimpleData.types.js"
import round from "../../helpers/round.js"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function roundValues(
    data: SimpleDataItem[],
    key: string,
    numDigits: number,
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

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
