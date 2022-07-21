import { SimpleDataItem } from "../types/index.js"
import SimpleData from "../class/SimpleData.js"
import { showTable_ } from "../methods/index.js"
import { log } from "../helpers/index.js"

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
                log("\n" + key + "()")
                this.logParameters && log("parameters:")
                this.logParameters && log(args)
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
                    showTable_(data, this.nbTableItemsToLog)
                }
                log(
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
                    showTable_(data, this.nbTableItemsToLog)
                }
                log(
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
