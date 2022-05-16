import { SimpleDataItem, Options } from "../types.js"

export default function replaceValues(data: SimpleDataItem[], key: string, oldValue: string, newValue: string, method: "entireString" | "partialString", options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    if (method === "entireString") {

        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === oldValue) {
                //@ts-ignore
                data[i][key] = newValue
            }
        }

    } else {
        const regex = new RegExp(oldValue, "g")

        for (let i = 0; i < data.length; i++) {
            if (typeof data[i][key] === "string") {
                //@ts-ignore
                data[i][key] = data[i][key].replace(regex, newValue)
            }
        }
    }

    return data
}