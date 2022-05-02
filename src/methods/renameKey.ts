import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import SimpleData from "../class/SimpleData.js"

export default function renameKey(data: SimpleDataItem[], oldKey: string, newKey: string, opts: Options): SimpleDataItem[] {

    const options: Options = {
        ...defaultOptions,
        ...opts
    }

    options.logs && console.log("\nrename()", oldKey, newKey, options)

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    options.logs && console.log(data)

    return data
}