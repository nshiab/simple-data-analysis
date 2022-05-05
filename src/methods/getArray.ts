import { SimpleDataItem, Options, defaultOptions } from "../types.js"

export default function getArray(data: SimpleDataItem[], key: string, options?: Options): any[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\ngetArray()", key, options)

    if (!data[0].hasOwnProperty(key)) {
        throw new Error(`No key ${key} in data`)
    }

    const array = data.map(d => d[key])

    options.logs && console.log(array)

    return array
}