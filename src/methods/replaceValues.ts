import { SimpleDataItem, Options } from "../types/SimpleData.types.js"
import hasKey from "../helpers/hasKey.js"

export default function replaceValues(data: SimpleDataItem[], key: string, oldValue: string, newValue: string, method: "entireString" | "partialString"): SimpleDataItem[] {

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
            if (typeof data[i][key] === "string") {
                const val = data[i][key] as string
                data[i][key] = val.replace(regex, newValue)
            }
        }
    }

    return data
}