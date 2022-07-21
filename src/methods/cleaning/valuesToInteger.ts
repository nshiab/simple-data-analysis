import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function valuesToInteger(
    data: SimpleDataItem[],
    key: string,
    thousandSeparator = ",",
    decimalSeparator = ".",
    skipErrors = false
): SimpleDataItem[] {
    if (!helpers.hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    const thousandSeparatorRegex = new RegExp(thousandSeparator, "g")
    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        if (typeof value === "string") {
            const valueClean = value
                .replace(thousandSeparatorRegex, "")
                .replace(decimalSeparator, ".")
            if (helpers.isValidNumber(valueClean)) {
                const newValue = parseInt(valueClean)
                if (!skipErrors && !Number.isInteger(newValue)) {
                    throw new Error(
                        value +
                            " is converted to " +
                            newValue +
                            " is not an integer. If you want to ignore values that are not valid, pass { skipErrors: true }."
                    )
                }
                data[i][key] = parseInt(valueClean)
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
            if (!skipErrors && !Number.isInteger(value)) {
                throw new Error(
                    value +
                        " is not a valid integer. If you want to ignore values that are not valid, pass { skipErrors: true }."
                )
            }
        }
    }

    return data
}
