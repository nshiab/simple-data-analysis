import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import removeKey from "../restructuring/removeKey.js"

export default function replaceValues(
    data: SimpleDataItem[],
    key: string,
    oldValue: SimpleDataValue,
    newValue: SimpleDataValue,
    method: undefined | "entireString" | "partialString" = undefined,
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

    if (typeof oldValue === "string" && typeof newValue === "string") {
        if (
            method === undefined ||
            !["entireString", "partialString"].includes(method)
        ) {
            throw new Error(
                "oldValue and newValue are strings. Specify how you would like to replace the strings. To replace entire strings values only, use {method: 'entireString'} and to replace part of string values use {method: 'partialString'}."
            )
        }

        if (method === "entireString") {
            for (let i = 0; i < data.length; i++) {
                if (data[i][key] === oldValue) {
                    data[i][keyToUpdate] = newValue
                }
            }
        } else {
            const regex = new RegExp(oldValue, "g")

            for (let i = 0; i < data.length; i++) {
                const val = data[i][key]
                if (typeof val !== "string") {
                    if (!skipErrors) {
                        if (newKey) {
                            removeKey(data, newKey)
                        }
                        throw new Error(
                            val +
                                " is not a string. Convert to string first (valuesToString). If you want to ignore values that are not strings, pass { skipErrors: true }."
                        )
                    }
                } else {
                    data[i][keyToUpdate] = val.replace(regex, newValue)
                }
            }
        }
    } else {
        if (method !== undefined) {
            throw new Error(
                "Because oldValue and newValue are not strings, you cannot specify a method. The values exactly equal to the oldValue will be replaced by the newValue. Remove the method or set it as undefined."
            )
        }

        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === oldValue) {
                data[i][keyToUpdate] = newValue
            }
        }
    }

    return data
}
