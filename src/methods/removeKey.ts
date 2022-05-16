import log from "../helpers/log"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import showTable from "./showTable"

export default function removeKey(data: SimpleDataItem[], key: string, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        delete data[i][key]
    }

    return data
}