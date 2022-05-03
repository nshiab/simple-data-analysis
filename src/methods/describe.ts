import { SimpleDataItem, Options, defaultOptions } from "../types.js"

export default function describe(data: SimpleDataItem[], options: Options): number {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\ndescribe()", options)

    options.logs && console.log(data.length)

    return data.length
}