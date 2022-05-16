import log from "../helpers/log"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import showTable from "./showTable"
//@ts-ignore
import { utcFormat } from "d3-time-format"

export default function datesToString(data: SimpleDataItem[], key: string, format: string, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    const formatF = utcFormat(format)

    for (let i = 0; i < data.length; i++) {
        //@ts-ignore
        data[i][key] = formatF(data[i][key])
    }

    return data
}