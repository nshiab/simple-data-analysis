import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function replaceValues(data: SimpleDataItem[], key: string, oldValue: string, newValue: string, method: "entireString" | "partialString", options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nreplaceValues() " + key + " " + oldValue + " " + newValue + " " + method)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    if (method === "entireString") {

        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === oldValue) {
                //@ts-ignore
                data[i][key] = data[i][key].replace(oldValue, newValue)
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

    options.logs && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data
}