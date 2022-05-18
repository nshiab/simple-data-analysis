import showTable from "../methods/showTable.js"
import SimpleData from "../class/SimpleData.js"
import log from "./log.js"

export default function logCall(){
    return function(_: unknown, key: string, descriptor: any){
        const wrappedFunc = descriptor.value
        descriptor.value = function(...args: any[]){
            if (this._verbose){
                log("\n" + key + "()")
                this._logParameters && log("parameters:")
                this._logParameters && log(args)
            }

            const start = Date.now()
            const result: any = wrappedFunc.apply(this, args)
            const end = Date.now()

            if (this._verbose) {
                const data = result instanceof SimpleData? result.data : result
                showTable(data, this._nbTableItemsToLog)
                log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            }
            
            return result
        }
        return descriptor
    }
}