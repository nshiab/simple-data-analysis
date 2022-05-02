import { SimpleDataItem, Options, defaultOptions } from "../types.js"

export default function describe(data: SimpleDataItem[], opts: Options): number {

    const options: Options = {
        ...defaultOptions,
        ...opts
    }

    options.logs && console.log("\ndescribe()", options)

    options.logs && console.log(data.length)

    return data.length
}