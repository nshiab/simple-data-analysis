import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import isValidNumber from "../../helpers/isValidNumber.js"
import removeKey from "../restructuring/removeKey.js"

export default function valuesToInteger(
    data: SimpleDataItem[],
    key: string,
    thousandSeparator = ",",
    decimalSeparator = ".",
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

    if (thousandSeparator === decimalSeparator) {
        throw new Error(
            'thousandSeparator and decimalSeparator are both "' +
                decimalSeparator +
                '". Add the values associated with the two of them. They have to be different.'
        )
    }

    const thousandSeparatorRegex = new RegExp(thousandSeparator, "g")
    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        if (typeof value === "string") {
            const valueClean = value
                .replace(thousandSeparatorRegex, "")
                .replace(decimalSeparator, ".")
            if (isValidNumber(valueClean)) {
                const newValue = parseInt(valueClean)
                if (!skipErrors && !Number.isInteger(newValue)) {
                    if (newKey) {
                        removeKey(data, newKey)
                    }
                    throw new Error(
                        value +
                            " is converted to " +
                            newValue +
                            " is not an integer. If you want to ignore values that are not valid, pass { skipErrors: true }."
                    )
                }
                data[i][keyToUpdate] = parseInt(valueClean)
            } else {
                if (!skipErrors) {
                    if (newKey) {
                        removeKey(data, newKey)
                    }
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
                if (newKey) {
                    removeKey(data, newKey)
                }
                throw new Error(
                    value +
                        " is not a valid integer. If you want to ignore values that are not valid, pass { skipErrors: true }."
                )
            }
        }
    }

    return data
}
