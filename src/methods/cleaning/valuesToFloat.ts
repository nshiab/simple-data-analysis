import { SimpleDataItem } from "../../types/SimpleData.types.js"
import isValidNumber from "../../helpers/isValidNumber.js"
import getKeyToUpdate from "../../helpers/getKeyToUpdate.js"

export default function valuesToFloat(
    data: SimpleDataItem[],
    key: string,
    thousandSeparator = ",",
    decimalSeparator = ".",
    skipErrors = false,
    newKey?: string
): SimpleDataItem[] {
    const keyToUpdate = getKeyToUpdate(data, key, newKey)

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

        try {
            if (typeof value == "number") {
                data[i][keyToUpdate] = value
            } else if (typeof value === "string") {
                const valueClean = value
                    .replace(thousandSeparatorRegex, "")
                    .replace(decimalSeparator, ".")
                if (isValidNumber(valueClean)) {
                    const newVal = parseFloat(valueClean)
                    if (!skipErrors && isNaN(newVal)) {
                        throw new Error(
                            value +
                                " (" +
                                valueClean +
                                " after ajusting thousandSeparator and decimalSeparator) is converted to " +
                                newVal +
                                " which is not a float. If you want to ignore values that are not valid, pass { skipErrors: true }."
                        )
                    }
                    data[i][keyToUpdate] = newVal
                } else {
                    throw new Error(
                        value +
                            " (" +
                            valueClean +
                            " after ajusting thousandSeparator and decimalSeparator) is not a valid number. If you want to ignore values that are not valid, pass { skipErrors: true }."
                    )
                }
            } else {
                throw new Error(
                    value +
                        " is not a string that can be converted to a number. If you want to ignore values that are not valid, pass { skipErrors: true }."
                )
            }
        } catch (error) {
            if (error instanceof Error && !skipErrors) {
                throw new Error(String(error.message))
            }
            data[i][keyToUpdate] = value
        }
    }

    return data
}
