import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"

export default function valuesToInteger(
    data: SimpleDataItem[],
    key: string,
    language: "fr" | "en" = "en",
    skipErrors = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (language === "en") {
        for (let i = 0; i < data.length; i++) {
            const value = data[i][key]
            if (typeof value !== "string") {
                if (!skipErrors) {
                    throw new Error(
                        value +
                            " is not a string. Convert to string first (valuesToString()). If you want to ignore values that are not strings, pass { skipErrors: true }."
                    )
                }
            } else {
                data[i][key] = parseInt(value.replace(/,/g, ""))
            }
        }
    } else if (language === "fr") {
        for (let i = 0; i < data.length; i++) {
            const value = data[i][key]
            if (typeof value !== "string") {
                if (!skipErrors) {
                    throw new Error(
                        value +
                            " is not a string. Convert to string first (valuesToString()). If you want to ignore values that are not strings, pass { skipErrors: true }."
                    )
                }
            } else {
                data[i][key] = parseInt(
                    value
                        .replace(/ /g, "")
                        .replace(/\u00A0/g, "")
                        .replace(",", ".")
                )
            }
        }
    } else {
        throw new Error("Unknown langage. Only en and fr are supported.")
    }

    return data
}
