import { SimpleDataItem } from "../types/index.js"
import methods from "../methods/index.js"
import helpers from "../helpers/index.js"

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
                helpers.log("\n" + key + "()")
                this.logParameters && helpers.log("parameters:")
                this.logParameters && helpers.log(args)
            }

            const start = Date.now()
            const result: SimpleDataItem[] = await wrappedFunc.apply(this, args)
            const end = Date.now()

            if (this.verbose) {
                methods.showTable_(this._tempData, this.nbTableItemsToLog)
                helpers.log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            }

            return result
        }

        return descriptor
    }
}
