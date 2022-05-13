import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore
import { utcParse } from "d3-time-format"

export default function valuesToDate(data: SimpleDataItem[], key: string, format: string, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    const parse = utcParse(format)

    for (let i = 0; i < data.length; i++) {
        //@ts-ignore
        data[i][key] = parse(data[i][key])
    }

    return data
}