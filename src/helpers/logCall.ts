import showTable from "../methods/showTable.js"
import SimpleData from "../class/SimpleData.js"
import log from "./log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"

export function logCall() {
    return function (_: unknown, key: string, descriptor: any) {
        const wrappedFunc = descriptor.value

        descriptor.value = function (...args: any[]) {
            try {
                if (this.verbose) {
                    log("\n" + key + "()")
                    this.logParameters && log("parameters:")
                    this.logParameters && log(args)
                }

                const start = Date.now()
                const result: SimpleDataItem[] = wrappedFunc.apply(this, args)
                const end = Date.now()

                if (args[0] && !args[0].overwrite) {
                    const data =
                        result instanceof SimpleData ? result._tempData : result
                    showTable(data, this.nbTableItemsToLog)
                    log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
                } else if (this.verbose) {
                    const data =
                        result instanceof SimpleData ? result.getData() : result
                    showTable(data, this.nbTableItemsToLog)
                    log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
                }

                return result
            } catch (error) {
                console.log(error)
            }
        }

        return descriptor
    }
}

export function asyncLogCall() {
    return function (_: unknown, key: string, descriptor: any) {
        const wrappedFunc = descriptor.value

        descriptor.value = async function (...args: any[]) {
            try {
                if (this.verbose) {
                    log("\n" + key + "()")
                    this.logParameters && log("parameters:")
                    this.logParameters && log(args)
                }

                const start = Date.now()
                const result: SimpleDataItem[] = await wrappedFunc.apply(
                    this,
                    args
                )
                const end = Date.now()

                if (this.verbose) {
                    showTable(this._tempData, this.nbTableItemsToLog)
                    log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
                }

                return result
            } catch (error) {
                console.log(error)
            }
        }

        return descriptor
    }
}
