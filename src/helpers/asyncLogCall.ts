import showTable from "../methods/showTable.js"
import log from "./log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"

export default function asyncLogCall() {
    return function (
        _: unknown,
        key: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        descriptor: any
    ) {
        const wrappedFunc = descriptor.value

        descriptor.value = async function (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...args: any[]
        ) {
            if (this.verbose) {
                log("\n" + key + "()")
                this.logParameters && log("parameters:")
                this.logParameters && log(args)
            }

            const start = Date.now()
            const result: SimpleDataItem[] = await wrappedFunc.apply(this, args)
            const end = Date.now()

            if (this.verbose) {
                showTable(this._tempData, this.nbTableItemsToLog)
                log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            }

            return result
        }

        return descriptor
    }
}
