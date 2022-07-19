import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { utcParse } from "d3-time-format"
import hasKey from "../../helpers/hasKey.js"

export default function valuesToDate(
    data: SimpleDataItem[],
    key: string,
    format: string,
    skipErrors = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (typeof data[0][key] !== "string") {
        throw new Error("Key " + key + " should be a string.")
    }

    const parse = utcParse(format)

    for (let i = 0; i < data.length; i++) {
        const val = data[i][key]
        if (typeof val !== "string") {
            if (!skipErrors) {
                throw new Error(
                    val +
                        " is not a string. Convert to string first (valuesToString()). If you want to ignore values that are not strings, pass { skipErrors: true }."
                )
            }
        } else {
            data[i][key] = parse(val)
        }
    }

    return data
}
