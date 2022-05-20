import showTable from "../methods/showTable.js"
import SimpleData from "../class/SimpleData.js"
import log from "./log.js"

export function logCall() {
    return function (_: unknown, key: string, descriptor: any) {
        const wrappedFunc = descriptor.value

        descriptor.value = function (...args: any[]) {
            if (this.verbose) {
                log("\n" + key + "()")
                this.logParameters && log("parameters:")
                this.logParameters && log(args)
            }

            const start = Date.now()
            const result: any = wrappedFunc.apply(this, args)
            const end = Date.now()

            if (this.verbose) {
                const data =
                    result instanceof SimpleData ? result.getData() : result
                showTable(data, this.nbTableItemsToLog)
                log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            }

            return result
        }

        return descriptor
    }
}

export function asyncLogCall() {
    return function (_: unknown, key: string, descriptor: any) {
        const wrappedFunc = descriptor.value

        descriptor.value = async function (...args: any[]) {
            if (this.verbose) {
                log("\n" + key + "()")
                this.logParameters && log("parameters:")
                this.logParameters && log(args)
            }

            const start = Date.now()
            const result: any = await wrappedFunc.apply(this, args)
            const end = Date.now()

            if (this.verbose) {
                const data =
                    result instanceof SimpleData ? result.getData() : result
                showTable(data, this.nbTableItemsToLog)
                log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            }

            return result
        }

        return descriptor
    }
}
