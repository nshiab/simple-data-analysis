import cloneData_ from "../methods/cloneData.js"
import renameKey_ from "../methods/renameKey.js"
import describe_ from "../methods/describe.js"
import formatAllKeys_ from "../methods/formatAllKeys.js"
import getArray_ from "../methods/getArray.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/checkValues.js"
import excludeMissingValues_ from "../methods/excludeMissingValues.js"
import removeKey_ from "../methods/removeKey.js"
import valuesToString_ from "../methods/valuesToString.js"
import valuesToInteger_ from "../methods/valuesToInteger.js"
import valuesToFloat_ from "../methods/valuesToFloat.js"
import valuesToDate_ from "../methods/valuesToDate.js"
import datesToString_ from "../methods/datesToString.js"
import filterValues_ from "../methods/filterValues.js"
import filterItems_ from "../methods/filterItems.js"
import roundValues_ from "../methods/roundValues.js"
import replaceValues_ from "../methods/replaceValues.js"
import addKey_ from "../methods/addKey.js"
import modifyValues_ from "../methods/modifyValues.js"
import modifyItems_ from "../methods/modifyItems.js"
import sortValues_ from "../methods/sortValues.js"
import addQuantiles_ from "../methods/addQuantiles.js"
import addBins_ from "../methods/addBins.js"
import addOutliers_ from "../methods/addOutliers.js"
import excludeOutliers_ from "../methods/excludeOutliers.js"
import { SimpleDataItem, Options } from "../types.js"


export default class SimpleData {

    data: SimpleDataItem[]

    constructor(incomingData: SimpleDataItem[]) {
        this.data = incomingData
    }

    cloneData(options: Options) {
        return cloneData_(this.data, options)
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

    modifyValues(key: string, func: Function, options: Options) {
        this.data = modifyValues_(this.data, key, func, options)
        return this
    }

    modifyItems(key: string, func: Function, options: Options) {
        this.data = modifyItems_(this.data, key, func, options)
        return this
    }

    formatAllKeys(options: Options) {
        this.data = formatAllKeys_(this.data, options)
        return this
    }

    valuesToString(key: string, options: Options) {
        this.data = valuesToString_(this.data, key, options)
        return this
    }

    valuesToInteger(key: string, options: Options) {
        this.data = valuesToInteger_(this.data, key, options)
        return this
    }

    valuesToFloat(key: string, options: Options) {
        this.data = valuesToFloat_(this.data, key, options)
        return this
    }

    valuesToDate(key: string, format: string, options: Options) {
        this.data = valuesToDate_(this.data, key, format, options)
        return this
    }

    datesToString(key: string, format: string, options: Options) {
        this.data = datesToString_(this.data, key, format, options)
        return this
    }

    filterValues(key: string, func: Function, options: Options) {
        this.data = filterValues_(this.data, key, func, options)
        return this
    }

    filterItems(func: Function, options: Options) {
        this.data = filterItems_(this.data, func, options)
        return this
    }

    roundValues(key: string, options: Options) {
        this.data = roundValues_(this.data, key, options)
        return this
    }

    replaceValues(key: string, oldValue: string, newValue: string, options: Options) {
        this.data = replaceValues_(this.data, key, oldValue, newValue, options)
        return this
    }

    sortValues(key: string, order: "ascending" | "descending", options: Options) {
        this.data = sortValues_(this.data, key, order, options)
        return this
    }

    addQuantiles(key: "string", newKey: "string", nbIntervals: number, options: Options) {
        this.data = addQuantiles_(this.data, key, newKey, nbIntervals, options)
        return this
    }

    addBins(key: "string", newKey: "string", nbBins: number, options: Options) {
        this.data = addBins_(this.data, key, newKey, nbBins, options)
        return this
    }

    addOutliers(key: "string", newKey: "string", method: "boxplot", options: Options) {
        this.data = addOutliers_(this.data, key, newKey, method, options)
        return this
    }

    excludeOutliers(key: "string", method: "boxplot", options: Options) {
        this.data = excludeOutliers_(this.data, key, method, options)
        return this
    }

    showTable(options: Options) {
        showTable_(this.data, options)
        return this
    }

}