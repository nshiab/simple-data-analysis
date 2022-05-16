import clone_ from "../methods/clone"
import renameKey_ from "../methods/renameKey"
import describe_ from "../methods/describe"
import formatAllKeys_ from "../methods/formatAllKeys"
import getArray_ from "../methods/getArray"
import showTable_ from "../methods/showTable"
import checkValues_ from "../methods/checkValues"
import excludeMissingValues_ from "../methods/excludeMissingValues"
import removeKey_ from "../methods/removeKey"
import valuesToString_ from "../methods/valuesToString"
import valuesToInteger_ from "../methods/valuesToInteger"
import valuesToFloat_ from "../methods/valuesToFloat"
// import valuesToDate_ from "../methods/valuesToDate"
// import datesToString_ from "../methods/datesToString"
import filterValues_ from "../methods/filterValues"
// import filterItems_ from " ../methods/filterItems"
import roundValues_ from "../methods/roundValues"
import replaceValues_ from "../methods/replaceValues"
import addKey_ from "../methods/addKey"
import selectKeys_ from "../methods/selectKeys"
import modifyValues_ from "../methods/modifyValues"
import modifyItems_ from "../methods/modifyItems"
import sortValues_ from "../methods/sortValues"
// import addQuantiles_ from "../methods/addQuantiles"
// import addBins_ from "../methods/addBins"
// import addOutliers_ from "../methods/addOutliers"
// import excludeOutliers_ from "../methods/excludeOutliers"
import correlation_ from "../methods/correlation"
import addItems_ from "../methods/addItems"
import getUniqueValues_ from "../methods/getUniqueValues"
// import summarize_ from "../methods/summarize"
import saveData_ from "../methods/saveData"
import mergeItems_ from "../methods/mergeItems"
import checkKeys from "../helpers/checkKeys"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import logInfos from "../helpers/logInfos"


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

    setDefaultOptions(options: Options) {
        this._defaultOptions = { ...this._defaultOptions, ...options }
        this._defaultOptions.logs && console.log("\nsetDefaultOptions()")
        this._defaultOptions.logs && console.log(this._defaultOptions)
        return this
    }

    clone(options: Options) {
        // very specific case with two options passed as arguments. Can't use ...args directly. And we don't return data, but a new SimpleData.
        const newSimpleData = logInfos(
            this,
            clone_,
            this._defaultOptions,
            options === undefined ? this._defaultOptions : options
        )
        return newSimpleData
    }

    getArray(...args: any[]) {
        // We don't update data and we don't return this
        const data = logInfos(
            this,
            getArray_,
            ...args
        )
        return data
    }

    getUniqueValues(...args: any[]) {
        // We don't update data and we don't return this
        const data = logInfos(
            this,
            getUniqueValues_,
            ...args
        )
        return data
    }

    checkValues(...args: any[]) {
        const data = logInfos(
            this,
            checkValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    excludeMissingValues(key: "onAllKeys" | string, options: Options) {
        // We need to deal with arguments manually. In case of undefined key, we run on all keys.
        const data = logInfos(
            this,
            excludeMissingValues_,
            key,
            options === undefined ? this._defaultOptions : options
        )
        this.#updateSimpleData(data)
        return this
    }

    describe(...args: any[]) {
        const data = logInfos(
            this,
            describe_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    renameKey(...args: any[]) {
        const data = logInfos(
            this,
            renameKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    removeKey(...args: any[]) {
        const data = logInfos(
            this,
            removeKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    addKey(...args: any[]) {
        const data = logInfos(
            this,
            addKey_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    selectKeys(...args: any[]) {
        const data = logInfos(
            this,
            selectKeys_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyValues(...args: any[]) {
        const data = logInfos(
            this,
            modifyValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    modifyItems(...args: any[]) {
        const data = logInfos(
            this,
            modifyItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    formatAllKeys(...args: any[]) {
        const data = logInfos(
            this,
            formatAllKeys_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }


    valuesToString(...args: any[]) {
        const data = logInfos(
            this,
            valuesToString_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToInteger(...args: any[]) {
        const data = logInfos(
            this,
            valuesToInteger_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    valuesToFloat(...args: any[]) {
        const data = logInfos(
            this,
            valuesToFloat_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    // valuesToDate(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         valuesToDate_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    // datesToString(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         datesToString_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    filterValues(...args: any[]) {
        const data = logInfos(
            this,
            filterValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    // filterItems(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         filterItems_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    roundValues(...args: any[]) {
        const data = logInfos(
            this,
            roundValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    replaceValues(...args: any[]) {
        const data = logInfos(
            this,
            replaceValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    sortValues(...args: any[]) {
        const data = logInfos(
            this,
            sortValues_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    // addQuantiles(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         addQuantiles_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    // addBins(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         addBins_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    // addOutliers(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         addOutliers_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    // excludeOutliers(...args: any[]) {
    //     const data = logInfos(
    //         this,
    //         excludeOutliers_,
    //         ...args
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    correlation(key1: string, key2: string, options: Options) {
        // We deal with the parameters manually to deal with optional arguments
        const data = logInfos(
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
        const data = logInfos(
            this,
            addItems_,
            ...args
        )
        this.#updateSimpleData(data)
        return this
    }

    mergeItems(dataToBeMerged: SimpleDataItem[], commonKey: string, options: Options) {
        const data = mergeItems_(this.data, dataToBeMerged, commonKey, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    // summarize(value?: string, key?: string, summary?: any, weight?: string, options?: Options) {
    //     // We deal with the parameters manually to deal with optional arguments
    //     // Note that the parameters are in different order in the parameters array
    //     const data = logInfos(
    //         this,
    //         summarize_,
    //         key === undefined ? "no key" : key,
    //         // Everything except weightedMean
    //         summary === undefined ? ["count", "min", "max", "sum", "mean", "median", "deviation"] : summary,
    //         value === undefined ? this._keys : value,
    //         weight === undefined ? "no weight" : weight,
    //         options === undefined ? this._defaultOptions : options
    //     )
    //     this.#updateSimpleData(data)
    //     return this
    // }

    saveData(...args: any[]) {
        // We don't update data
        logInfos(
            this,
            saveData_,
            ...args
        )
        return this
    }

    showTable(...args: any[]) {
        // we don't update data
        logInfos(
            this,
            showTable_,
            ...args
        )
        return this
    }

}