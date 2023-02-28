import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcParse } from "d3-time-format"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function valuesToDate(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

    const parse = utcParse(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]

        try {
            if (val instanceof Date && isNaN(val as unknown as number)) {
                throw new Error(
                    "An value is " +
                        val +
                        " (before being converted), which cannot be converted to a valid date. If you want to bypass this error and keep the value, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
                )
            } else if (val instanceof Date) {
                data[i][keyToUpdate] = data[i][key]
            } else if (typeof val !== "string") {
                throw new Error(
                    val +
                        " is not a string. Convert to string first (valuesToString()). If you want to bypass this error, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
                )
            } else {
                const newVal = parse(val)
                if (newVal instanceof Date === false) {
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
