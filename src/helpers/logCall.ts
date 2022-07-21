import { SimpleDataItem } from "../types/index.js"
import SimpleData from "../class/SimpleData.js"
import methods from "../methods/index.js"
import helpers from "../helpers/index.js"

export default function logCall() {
    return function (
        _: unknown,
        key: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        descriptor: any
    ) {
        const wrappedFunc = descriptor.value

        descriptor.value = function (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...args: any[]
        ) {
            if (!this.noLogs && (this.verbose || !this._overwrite)) {
                helpers.log("\n" + key + "()")
                this.logParameters && helpers.log("parameters:")
                this.logParameters && helpers.log(args)
            }

            const start = Date.now()
            const result: SimpleDataItem[] = wrappedFunc.apply(this, args)
            const end = Date.now()
            const duration = end - start
            this._duration = this._duration + duration

            if (!this.noLogs && !this._overwrite) {
                if (!key.includes("Chart") && !key.includes("save")) {
                    const data =
                        result instanceof SimpleData ? result._tempData : result
                    methods.showTable_(data, this.nbTableItemsToLog)
                }
                helpers.log(
                    `Done in ${(duration / 1000).toFixed(
                        3
                    )} sec. / Total duration ${(this._duration / 1000).toFixed(
                        3
                    )}.`
                )
            } else if (this.verbose) {
                if (!key.includes("Chart") && !key.includes("save")) {
                    const data =
                        result instanceof SimpleData ? result.getData() : result
                    methods.showTable_(data, this.nbTableItemsToLog)
                }
                helpers.log(
                    `Done in ${((end - start) / 1000).toFixed(
                        3
                    )} sec. / Total duration ${(this._duration / 1000).toFixed(
                        3
                    )}.`
                )
            }

            return result
        }

        return descriptor
    }
}
