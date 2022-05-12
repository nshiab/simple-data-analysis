import showTable from "../methods/showTable"
import { defaultOptions } from "../types"
import log from "./log"

export default function (name: string, parameters: any, func: Function) {
    const start = Date.now()

    parameters.options = {
        ...defaultOptions,
        ...parameters.options
    }

    parameters.options.logs && log("\naddItems()")
    parameters.options.logOptions && log("options:")
    parameters.options.logOptions && log(parameters.options)

    // run func

    const data = func(...parameters)

    parameters.options.logs || parameters.options.showDataNoOverwrite && showTable(data, parameters.options)

    const end = Date.now()
    parameters.options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return parameters.options.showDataNoOverwrite ? parameters.data : data

}