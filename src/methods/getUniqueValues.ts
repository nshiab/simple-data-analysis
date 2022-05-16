import { SimpleDataItem, Options } from "../types"
import hasKey from "../helpers/hasKey"

export default function getUniqueValues(data: SimpleDataItem[], key: string, options?: Options): any[] {

    if (!hasKey(data[0], key)) {
        throw new Error(`No key ${key} in data`)
    }

    const uniques = [...new Set(data.map(d => d[key]))]

    return uniques
}