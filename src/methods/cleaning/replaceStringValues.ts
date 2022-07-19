import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function replaceStringValues(
    data: SimpleDataItem[],
    key: string,
    oldValue: string,
    newValue: string,
    method: "entireString" | "partialString",
    skipErrors = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (method === "entireString") {
        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === oldValue) {
                data[i][key] = newValue
            }
        }
    } else {
        const regex = new RegExp(oldValue, "g")

        for (let i = 0; i < data.length; i++) {
            const val = data[i][key]
            if (typeof val !== "string") {
                if (!skipErrors) {
                    throw new Error(
                        val +
                            " is not a string. Convert to string first (valuesToString). If you want to ignore values that are not strings, pass { skipErrors: true }."
                    )
                }
            } else {
                data[i][key] = val.replace(regex, newValue)
            }
        }
    }

    return data
}
