import { SimpleDataItem, Options } from "../types"

export default function getUniqueValues(data: SimpleDataItem[], key: string, options?: Options): any[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error(`No key ${key} in data`)
    }

    const uniques = [...new Set(data.map(d => d[key]))]

    return uniques
}