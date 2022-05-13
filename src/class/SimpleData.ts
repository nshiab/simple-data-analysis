import clone_ from "../methods/clone.js"
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
import correlation_ from "../methods/correlation.js"
import addItems_ from "../methods/addItems.js"
import getUniqueValues_ from "../methods/getUniqueValues.js"
import summarize_ from "../methods/summarize.js"
import saveData_ from "../methods/saveData.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import checkKeys from "../helpers/checkKeys.js"
import logDecorator from "../helpers/logDecorator.js"

export default class SimpleData {

    _data: SimpleDataItem[]
    _keys: string[]
    _defaultOptions: Options

    constructor(incomingData: SimpleDataItem[], options?: Options) {
        checkKeys(incomingData)
        this._data = incomingData
        this._keys = Object.keys(incomingData[0])
        this._defaultOptions = options === undefined ? defaultOptions : options
    }

    get data() {
        return this._data
    }

    get keys() {
        return this._keys
    }

    get options() {
        return this._defaultOptions
    }

    set data(data) {
        this._data = data
    }

    set keys(data) {
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    set options(options) {
        this._defaultOptions = options
    }

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    setDefaultOptions(options: Options) {
        this._defaultOptions = { ...this._defaultOptions, ...options }
        this._defaultOptions.logs && console.log("\nsetDefaultOptions()")
        this._defaultOptions.logs && console.log(this._defaultOptions)
        return this
    }

    clone(options: Options) {
        // very specific case with two options passed as arguments. Can't use ...args directly. And we don't return data, but a new SimpleData.
        const newSimpleData = logDecorator(
            this,
            clone_,
            this._defaultOptions,
            options === undefined ? this._defaultOptions : options
        )
        return newSimpleData
    }

    getArray(...args: any[]) {
        // We don't update data and we don't return this
        const data = logDecorator(
            this,
            getArray_,
            ...args
        )
        return data
    }

    getUniqueValues(...args: any[]) {
        // We don't update data and we don't return this
        const data = logDecorator(
            this,
            getUniqueValues_,
            ...args
        )
        return data
    }

    checkValues(...args: any[]) {
        const data = logDecorator(
            this,
            checkValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    excludeMissingValues(key: "onAllKeys" | string, options: Options) {
        // We need to deal with arguments manually. In case of undefined key, we run on all keys.
        const data = logDecorator(
            this,
            excludeMissingValues_,
            key,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    describe(...args: any[]) {
        const data = logDecorator(
            this,
            describe_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    renameKey(...args: any[]) {
        const data = logDecorator(
            this,
            renameKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    removeKey(...args: any[]) {
        const data = logDecorator(
            this,
            removeKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addKey(...args: any[]) {
        const data = logDecorator(
            this,
            addKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyValues(...args: any[]) {
        const data = logDecorator(
            this,
            modifyValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyItems(...args: any[]) {
        const data = logDecorator(
            this,
            modifyItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    formatAllKeys(...args: any[]) {
        const data = logDecorator(
            this,
            formatAllKeys_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }


    valuesToString(...args: any[]) {
        const data = logDecorator(
            this,
            valuesToString_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToInteger(...args: any[]) {
        const data = logDecorator(
            this,
            valuesToInteger_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToFloat(...args: any[]) {
        const data = logDecorator(
            this,
            valuesToFloat_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToDate(...args: any[]) {
        const data = logDecorator(
            this,
            valuesToDate_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    datesToString(...args: any[]) {
        const data = logDecorator(
            this,
            datesToString_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    filterValues(...args: any[]) {
        const data = logDecorator(
            this,
            filterValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    filterItems(...args: any[]) {
        const data = logDecorator(
            this,
            filterItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    roundValues(...args: any[]) {
        const data = logDecorator(
            this,
            roundValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    replaceValues(...args: any[]) {
        const data = logDecorator(
            this,
            replaceValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    sortValues(...args: any[]) {
        const data = logDecorator(
            this,
            sortValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addQuantiles(...args: any[]) {
        const data = logDecorator(
            this,
            addQuantiles_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addBins(...args: any[]) {
        const data = logDecorator(
            this,
            addBins_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addOutliers(...args: any[]) {
        const data = logDecorator(
            this,
            addOutliers_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    excludeOutliers(...args: any[]) {
        const data = logDecorator(
            this,
            excludeOutliers_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    correlation(key1: string, key2: string, options: Options) {
        // We deal with the parameters manually to deal with optional arguments
        const data = logDecorator(
            this,
            correlation_,
            key1,
            key2,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    addItems(...args: any[]) {
        const data = logDecorator(
            this,
            addItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    summarize(value?: string, key?: string, summary?: any, weight?: string, options?: Options) {
        // We deal with the parameters manually to deal with optional arguments
        // Note that the parameters are in different order in the parameters array
        const data = logDecorator(
            this,
            summarize_,
            key === undefined ? "no key" : key,
            // Everything except weightedMean
            summary === undefined ? ["count", "min", "max", "sum", "mean", "median", "deviation"] : summary,
            value === undefined ? this._keys : value,
            weight === undefined ? "no weight" : weight,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    saveData(...args: any[]) {
        // We don't update data
        logDecorator(
            this,
            saveData_,
            ...args
        )
        return this
    }

    showTable(...args: any[]) {
        // we don't update data
        logDecorator(
            this,
            showTable_,
            ...args
        )
        return this
    }

}