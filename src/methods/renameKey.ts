import log from "../helpers/log"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import showTable from "./showTable"

export default function renameKey(data: SimpleDataItem[], oldKey: string, newKey: string, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(oldKey)) {
        throw new Error("No key " + oldKey)
    }

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    return data
}