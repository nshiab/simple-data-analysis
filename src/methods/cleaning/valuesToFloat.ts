import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import isValidNumber from "../../helpers/isValidNumber.js"

export default function valuesToFloat(
    data: SimpleDataItem[],
    key: string,
    thousandSeparator = ",",
    decimalSeparator = ".",
    skipErrors = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    const thousandSeparatorRegex = new RegExp(thousandSeparator, "g")
    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        if (typeof value === "string") {
            const valueClean = value
                .replace(thousandSeparatorRegex, "")
                .replace(decimalSeparator, ".")
            if (isValidNumber(valueClean)) {
                data[i][key] = parseFloat(valueClean)
            } else {
                if (!skipErrors) {
                    throw new Error(
                        value +
                            " (" +
                            valueClean +
                            " after ajusting thousandSeparator and decimalSeparator) is not a valid number. If you want to ignore values that are not valid, pass { skipErrors: true }."
                    )
                }
            }
        } else {
            if (!skipErrors && typeof value !== "number") {
                throw new Error(
                    value +
                        " is not a valid number. If you want to ignore values that are not valid, pass { skipErrors: true }."
                )
            }
        }
    }

    return data
}
