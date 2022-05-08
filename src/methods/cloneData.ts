import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore
import cloneDeep from "lodash.clonedeep"
import SimpleData from "../class/SimpleData.js"

export default function cloneData(data: SimpleDataItem[], options: Options): object {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\ncloneData()")
    options.logOptions && log("options:")
    options.logOptions && log(options)

    options.logs && showTable(data, options)

    const clonedData = cloneDeep(data)
    const newSimpleData = new SimpleData(clonedData)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return newSimpleData
}