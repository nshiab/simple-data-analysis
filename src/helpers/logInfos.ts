import showTable from "../methods/showTable.js"
import { Options, SimpleDataItem } from "../types"
import log from "./log.js"

export default function logInfos(startOrEnd: "start" | "end", parameters: any[], options: Options, func: (data: SimpleDataItem[], ...args: any[]) => any, start?: number, data?: SimpleDataItem[]) {

    if (startOrEnd === "start") {

        options.logs && log("\n" + func.name + "()")
        options.logOptions && log("options:")
        options.logOptions && log(options)
        options.logParameters && log("parameters:")
        options.logParameters && log(parameters.slice(0, parameters.length - 1))

    } else if (startOrEnd === "end") {

        (options.logs || options.showDataNoOverwrite) && data && showTable(data, options)
        const end = Date.now()
        options.logs && start && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    }

    return startOrEnd === "start" ? Date.now() : undefined
}