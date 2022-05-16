import showTable from "../methods/showTable.js"
import { defaultOptions } from "../types.js"
import log from "./log.js"

export default function logInfos(simpleData: any, func: Function, ...args: any[]) {

    const start = Date.now()

    const parameters = args
    let options

    if (
        args.length > 0 &&
        typeof args[args.length - 1] === "object" &&
        Object.keys(defaultOptions).includes(Object.keys(args[args.length - 1])[0])
    ) {
        options = { ...simpleData.options, ...args[args.length - 1] }
        parameters[args.length - 1] = options
    } else {
        options = simpleData.options
        parameters.push(options)
    }

    options.logs && log("\n" + func.name + "()")
    options.logOptions && log("options:")
    options.logOptions && log(options)
    options.logParameters && log("parameters:")
    options.logParameters && log(parameters.slice(0, parameters.length - 1))

    const data = func(simpleData.data, ...parameters)

    options.logs | options.showDataNoOverwrite && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return options.showDataNoOverwrite ? simpleData.data : data

}