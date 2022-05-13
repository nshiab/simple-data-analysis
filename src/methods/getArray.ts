import { SimpleDataItem, Options } from "../types.js"

export default function getArray(data: SimpleDataItem[], key: string, options?: Options): any[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error(`No key ${key} in data`)
    }

    const array = data.map(d => d[key])

    return array
}