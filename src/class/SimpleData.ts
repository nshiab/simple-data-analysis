import renameKey_ from "../methods/renameKey.js"
import describe_ from "../methods/describe.js"
import { SimpleDataItem, Options } from "../types.js"

export default class SimpleData {

    data: SimpleDataItem[]

    constructor(incomingData: SimpleDataItem[]) {
        this.data = incomingData
    }

    describe(options: Options) {
        describe_(this.data, options)
    }

    renameKey(oldKey: string, newKey: string, options: Options) {
        const data = renameKey_(this.data, oldKey, newKey, options)
        this.data = data
        return this
    }

}