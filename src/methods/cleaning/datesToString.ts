import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcFormat } from "d3-time-format"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function datesToString(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false,
    newKey?: string,
    noTests = false
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)
    const formatF = utcFormat(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]
        if (noTests) {
            data[i][keyToUpdate] = formatF(data[i][key] as Date)
        } else {
            try {
                if (val instanceof Date === false) {
                    throw new Error(
                        val +
                            " is not a Date. Convert to Date first (valuesToDate()). If you want to ignore values that are not strings, pass { skipErrors: true }. Keep in mind that all errors will be skipped."
                    )
                } else if (isNaN(val as unknown as number)) {
                    throw new Error(
                        val +
                            " is not a valid Date. If you want to ignore values that are not valid Date, pass { skipErrors: true }. "
                    )
                } else {
                    data[i][keyToUpdate] = formatF(data[i][key] as Date)
                }
            } catch (error) {
                if (error instanceof Error && !skipErrors) {
                    throw new Error(String(error.message))
                }
                data[i][keyToUpdate] = val
            }
        }
    }

    return data
}
