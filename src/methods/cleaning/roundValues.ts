import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { getKeyToUpdate, round } from "../../exports/helpers.js"

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

        try {
            if (typeof val !== "number") {
                throw new Error(
                    val +
                        " is not a number. Convert to number first (valuesToInteger() or valuesToFloat()). If you want to ignore values that are not numbers, pass { skipErrors: true }."
                )
            } else {
                data[i][keyToUpdate] = round(val as number, numDigits)
            }
        } catch (error) {
            if (error instanceof Error && !skipErrors) {
                throw new Error(String(error.message))
            }
            data[i][keyToUpdate] = val
        }
    }

    return data
}
