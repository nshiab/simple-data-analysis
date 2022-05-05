import renameKey_ from "../methods/renameKey.js"
import describe_ from "../methods/describe.js"
import formatAllKeys_ from "../methods/formatAllKeys.js"
import getArray_ from "../methods/getArray.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/checkValues.js"
import { SimpleDataItem, Options } from "../types.js"

export default class SimpleData {

    data: SimpleDataItem[]

    constructor(incomingData: SimpleDataItem[]) {
        this.data = incomingData
    }

    getArray(key: string, options: Options) {
        return getArray_(this.data, key, options)
    }

    checkValues(options: Options) {
        checkValues_(this.data, options)
    }

    describe(options: Options) {
        describe_(this.data, options)
    }

    renameKey(oldKey: string, newKey: string, options: Options) {
        const data = renameKey_(this.data, oldKey, newKey, options)
        this.data = data
        return this
    }

    formatAllKeys(options: Options) {
        const data = formatAllKeys_(this.data, options)
        this.data = data
        return this
    }

    showTable(options: Options) {
        showTable_(this.data, options)
    }

}