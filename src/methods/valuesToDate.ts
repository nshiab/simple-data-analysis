import log from "../helpers/log"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import showTable from "./showTable"
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