import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import log from "../helpers/log.js"

export default function describe(data: SimpleDataItem[], options: Options): number {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\ndescribe()")
    options.logOptions && log("options:")
    options.logOptions && log(options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data.length
}