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
            logParameters(this, key, args)

            const start = Date.now()
            const result: SimpleData | SimpleDataItem[] = wrappedFunc.apply(
                this,
                args
            )

            logDataAndDuration(this, result, start, key)

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
            const result: SimpleData | SimpleDataItem[] =
                await wrappedFunc.apply(this, args)

            logDataAndDuration(this, result, start, key)

            return result
        }

        return descriptor
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logParameters(sd: SimpleData, key: string, args: any) {
    if (sd.verbose) {
        log("\n" + key + "()")
        log("parameters:")
        log(args)
    }
}

function logDataAndDuration(
    sd: SimpleData,
    result: SimpleData | SimpleDataItem[],
    start: number,
    key: string
) {
    const end = Date.now()
    const duration = end - start
    sd.duration = sd.duration + duration

    if (sd.verbose) {
        if (!key.includes("Chart") && !key.includes("save")) {
            const data =
                result instanceof SimpleData ? result.getData() : result
            showTable(data, sd.nbTableItemsToLog)
        }
        log(
            `Done in ${round(duration / 1000, 3)} sec. / Total duration ${round(
                sd.duration / 1000,
                3
            )}.`
        )
    }
}
