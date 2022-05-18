import showTable from "../methods/showTable.js"
import log from "../helpers/log.js"

export default function logInfos(){
    return function(_: Object, key: string, descriptor: any){
        let wrappedFunc = descriptor.value
        descriptor.value = function(...args: any[]){
            this.options.logs && log("\n" + key + "()")
            this.options.logOptions && log("options:")
            this.options.logOptions && log(this.options)
            this.options.logParameters && log("parameters:")
            this.options.logParameters && log(args)

            const start = Date.now()
            const result: any = wrappedFunc.apply(this, args)
            const end = Date.now()

            this.options.logs && showTable(result, this.options)
            this.options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)
            
            return result
        }
        return descriptor
    }
}