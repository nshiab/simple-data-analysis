import showTable from "../methods/showTable.js"
import SimpleData from "../class/SimpleData.js"
import log from "./log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"
import round from "./round.js"

export function logCall() {
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
            if (!this.noLogs && this.verbose) {
                log("\n" + key + "()")
                this.logParameters && log("parameters:")
                this.logParameters && log(args)
            }

            const start = Date.now()
            const result: SimpleDataItem[] = wrappedFunc.apply(this, args)
            const end = Date.now()
            const duration = end - start
            this._duration = this._duration + duration

            if (!this.noLogs && this.verbose) {
                if (!key.includes("Chart") && !key.includes("save")) {
                    const data =
                        result instanceof SimpleData ? result.getData() : result
                    showTable(data, this.nbTableItemsToLog)
                }
                log(
                    `Done in ${round(
                        duration / 1000,
                        3
                    )} sec. / Total duration ${round(
                        this._duration / 1000,
                        3
                    )}.`
                )
            }

            return result
        }

        return descriptor
    }
}

export function asyncLogCall() {
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
            const duration = end - start
            this._duration = this._duration + duration

            if (this.verbose) {
                showTable(this._tempData, this.nbTableItemsToLog)
                log(`Done in ${round(duration / 1000, 3)} sec.`)
            }

            return result
        }

        return descriptor
    }
}
