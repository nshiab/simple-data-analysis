import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcFormat } from "d3-time-format"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function datesToString(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)
    const formatF = utcFormat(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]
        if (val instanceof Date === false) {
            if (!skipErrors) {
                throw new Error(
                    val +
                        " is not a Date. Convert to Date first (valuesToDate()). If you want to ignore values that are not strings, pass { skipErrors: true }."
                )
            }
        } else {
            data[i][keyToUpdate] = formatF(data[i][key] as Date)
        }
    }

    return data
}
