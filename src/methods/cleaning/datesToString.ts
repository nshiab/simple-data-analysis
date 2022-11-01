import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcFormat } from "d3-time-format"
import hasKey from "../../helpers/hasKey.js"
import removeKey from "../restructuring/removeKey.js"

export default function datesToString(
    data: SimpleDataItem[],
    key: string,
    format: string,
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

    const formatF = utcFormat(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]
        if (val instanceof Date === false) {
            if (!skipErrors) {
                if (newKey) {
                    removeKey(data, newKey)
                }
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
