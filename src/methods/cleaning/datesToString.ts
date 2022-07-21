import { utcFormat } from "d3-time-format"

import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function datesToString(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

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
            data[i][key] = formatF(data[i][key] as Date)
        }
    }

    return data
}
