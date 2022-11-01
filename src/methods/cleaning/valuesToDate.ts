import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcParse } from "d3-time-format"
import hasKey from "../../helpers/hasKey.js"

export default function valuesToDate(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (typeof data[0][key] !== "string") {
        throw new Error("Key " + key + " should be a string.")
    }

    if (newKey && hasKey(data[0], newKey)) {
        throw new Error(newKey + " already exists")
    }

    const keyToUpdate = newKey ? newKey : key

    const parse = utcParse(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]

        if (
            !skipErrors &&
            val instanceof Date &&
            isNaN(val as unknown as number)
        ) {
            throw new Error(
                "An value is " +
                    val +
                    " (before being converted), which cannot be converted to a valid date. If you want to bypass this error and keep the value, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
            )
        } else if (val instanceof Date && newKey) {
            data[i][keyToUpdate] = data[i][key]
        } else if (typeof val === "string") {
            const newVal = parse(val)
            if (!skipErrors && newVal instanceof Date === false) {
                throw new Error(
                    val +
                        " is converted to " +
                        newVal +
                        " with the format " +
                        format +
                        ". The output is not a valid Date. If you want to bypass this error, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
                )
            }
            data[i][keyToUpdate] = newVal
        } else {
            if (!skipErrors && val instanceof Date === false) {
                throw new Error(
                    val +
                        " is not a string. Convert to string first (valuesToString()). If you want to bypass this error, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
                )
            }
        }

        if (newKey && !hasKey(data[i], newKey) && skipErrors) {
            data[i][keyToUpdate] = null
        }
    }

    return data
}
