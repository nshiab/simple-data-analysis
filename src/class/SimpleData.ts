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
import selectKeys_ from "../methods/selectKeys.js"
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
import mergeItems_ from "../methods/mergeItems.js"
import checkKeys from "../helpers/checkKeys.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import getParametersAndOptions from "../helpers/getParametersAndOptions.js"
import logInfos from "../helpers/logInfos.js"


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
    set data(data) {
        this._data = data
    }

    get keys() {
        return this._keys
    }
    set keys(data) {
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    get options() {
        return this._defaultOptions
    }
    set options(options) {
        this._defaultOptions = options
    }

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    #apply(func: (data: SimpleDataItem[], ...args: any[]) => any, ...args: any[]) {

        const { parameters, options } = getParametersAndOptions(this._defaultOptions, ...args)

        const start = logInfos("start", parameters, options, func)

        const data = func(this._data, ...parameters)

        logInfos("end", parameters, options, func, start, data)

        return options.showDataNoOverwrite ? this._data : data
    }

    setDefaultOptions(options: Options) {
        this._defaultOptions = { ...this._defaultOptions, ...options }
        this._defaultOptions.logs && console.log("\nsetDefaultOptions()")
        this._defaultOptions.logs && console.log(this._defaultOptions)
        return this
    }

    clone(options: Options) {
        // very specific case with two options passed as arguments. Can't use ...args directly. And we don't return data, but a new SimpleData.
        const newSimpleData = this.#apply(
            clone_,
            this._defaultOptions,
            options === undefined ? this._defaultOptions : options
        )
        return newSimpleData
    }

    getArray(...args: any[]) {
        // We don't update data and we don't return this
        const data = this.#apply(
            getArray_,
            ...args
        )
        return data
    }

    getUniqueValues(...args: any[]) {
        // We don't update data and we don't return this
        const data = this.#apply(
            getUniqueValues_,
            ...args
        )
        return data
    }

    checkValues(...args: any[]) {
        const data = this.#apply(
            checkValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    excludeMissingValues(key: "onAllKeys" | string, options: Options) {
        // We need to deal with arguments manually. In case of undefined key, we run on all keys.
        const data = this.#apply(
            excludeMissingValues_,
            key,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    describe(...args: any[]) {
        const data = this.#apply(
            describe_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    renameKey(...args: any[]) {
        const data = this.#apply(
            renameKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    removeKey(...args: any[]) {
        const data = this.#apply(
            removeKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addKey(...args: any[]) {
        const data = this.#apply(
            addKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    selectKeys(...args: any[]) {
        const data = this.#apply(
            selectKeys_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyValues(...args: any[]) {
        const data = this.#apply(
            modifyValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyItems(...args: any[]) {
        const data = this.#apply(
            modifyItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    formatAllKeys(...args: any[]) {
        const data = this.#apply(
            formatAllKeys_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }


    valuesToString(...args: any[]) {
        const data = this.#apply(
            valuesToString_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToInteger(...args: any[]) {
        const data = this.#apply(
            valuesToInteger_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToFloat(...args: any[]) {
        const data = this.#apply(
            valuesToFloat_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToDate(...args: any[]) {
        const data = this.#apply(
            valuesToDate_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    datesToString(...args: any[]) {
        const data = this.#apply(
            datesToString_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    filterValues(...args: any[]) {
        const data = this.#apply(
            filterValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    filterItems(...args: any[]) {
        const data = this.#apply(
            filterItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    roundValues(...args: any[]) {
        const data = this.#apply(
            roundValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    replaceValues(...args: any[]) {
        const data = this.#apply(
            replaceValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    sortValues(...args: any[]) {
        const data = this.#apply(
            sortValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addQuantiles(...args: any[]) {
        const data = this.#apply(
            addQuantiles_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addBins(...args: any[]) {
        const data = this.#apply(
            addBins_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addOutliers(...args: any[]) {
        const data = this.#apply(
            addOutliers_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    excludeOutliers(...args: any[]) {
        const data = this.#apply(
            excludeOutliers_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    correlation(key1: string, key2: string, options: Options) {
        // We deal with the parameters manually to deal with optional arguments
        const data = this.#apply(
            correlation_,
            key1,
            key2,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    addItems(...args: any[]) {
        const data = this.#apply(
            addItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    mergeItems(dataToBeMerged: SimpleDataItem[], commonKey: string, options: Options) {
        // const data = mergeItems_(this.data, dataToBeMerged, commonKey, { ...this._defaultOptions, ...options })
        const data = this.#apply(
            mergeItems_,
            dataToBeMerged,
            commonKey,
            options
        )
        this.#updateSimpleData(data)
        return this
    }

    summarize(value?: string, key?: string, summary?: any, weight?: string, options?: Options) {
        // We deal with the parameters manually to deal with optional arguments
        // Note that the parameters are in different order in the parameters array
        const data = this.#apply(
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
        this.#apply(
            saveData_,
            ...args
        )
        return this
    }

    showTable(...args: any[]) {
        // we don't update data
        this.#apply(
            showTable_,
            ...args
        )
        return this
    }

}