import renameKey_ from "../methods/renameKey.js"
import describe_ from "../methods/describe.js"
import formatAllKeys_ from "../methods/formatAllKeys.js"
import getArray_ from "../methods/getArray.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/checkValues.js"
import excludeMissingValues_ from "../methods/excludeMissingValues.js"
import removeKey_ from "../methods/removeKey.js"
import toString_ from "../methods/toString.js"
import addKey_ from "../methods/addKey.js"
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
        return this
    }

    excludeMissingValues(key: "onAllItems" | string, options: Options) {
        this.data = excludeMissingValues_(this.data, key, options)
        return this
    }

    describe(options: Options) {
        describe_(this.data, options)
    }

    renameKey(oldKey: string, newKey: string, options: Options) {
        this.data = renameKey_(this.data, oldKey, newKey, options)
        return this
    }

    removeKey(key: string, options: Options) {
        this.data = removeKey_(this.data, key, options)
        return this
    }

    addKey(key: string, func: Function, options: Options) {
        this.data = addKey_(this.data, key, func, options)
        return this
    }

    formatAllKeys(options: Options) {
        this.data = formatAllKeys_(this.data, options)
        return this
    }

    toString(key: string, options: Options) {
        this.data = toString_(this.data, key, options)
        return this
    }

    showTable(options: Options) {
        showTable_(this.data, options)
        return this
    }

}