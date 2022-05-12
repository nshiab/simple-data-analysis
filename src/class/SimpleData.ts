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
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import checkKeys from "../helpers/checkKeys.js"


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

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    setDefaultOptions(options: Options) {
        this._defaultOptions = { ...this._defaultOptions, ...options }
        return this
    }

    clone(options: Options) {
        return clone_(this._data, this._defaultOptions, { ...this._defaultOptions, ...options })
    }

    getArray(key: string, options: Options) {
        return getArray_(this._data, key, { ...this._defaultOptions, ...options })
    }

    getUniqueValues(key: string, options: Options) {
        return getUniqueValues_(this._data, key, { ...this._defaultOptions, ...options })
    }

    checkValues(options: Options) {
        checkValues_(this._data, { ...this._defaultOptions, ...options })
        return this
    }

    excludeMissingValues(key: "onAllItems" | string, options: Options) {
        const data = excludeMissingValues_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    describe(options: Options) {
        const data = describe_(this._data, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    renameKey(oldKey: string, newKey: string, options: Options) {
        const data = renameKey_(this._data, oldKey, newKey, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    removeKey(key: string, options: Options) {
        const data = removeKey_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    addKey(key: string, func: Function, options: Options) {
        const data = addKey_(this._data, key, func, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    modifyValues(key: string, func: Function, options: Options) {
        const data = modifyValues_(this._data, key, func, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    modifyItems(key: string, func: Function, options: Options) {
        const data = modifyItems_(this._data, key, func, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    formatAllKeys(options: Options) {
        const data = formatAllKeys_(this._data, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    valuesToString(key: string, options: Options) {
        const data = valuesToString_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    valuesToInteger(key: string, options: Options) {
        const data = valuesToInteger_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    valuesToFloat(key: string, options: Options) {
        const data = valuesToFloat_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    valuesToDate(key: string, format: string, options: Options) {
        const data = valuesToDate_(this._data, key, format, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    datesToString(key: string, format: string, options: Options) {
        const data = datesToString_(this._data, key, format, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    filterValues(key: string, func: Function, options: Options) {
        const data = filterValues_(this._data, key, func, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    filterItems(func: Function, options: Options) {
        const data = filterItems_(this._data, func, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    roundValues(key: string, options: Options) {
        const data = roundValues_(this._data, key, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    replaceValues(key: string, oldValue: string, newValue: string, method: "entireString" | "partialString", options: Options) {
        const data = replaceValues_(this._data, key, oldValue, newValue, method, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    sortValues(key: string, order: "ascending" | "descending", options: Options) {
        const data = sortValues_(this._data, key, order, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    addQuantiles(key: "string", newKey: "string", nbIntervals: number, options: Options) {
        const data = addQuantiles_(this._data, key, newKey, nbIntervals, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    addBins(key: "string", newKey: "string", nbBins: number, options: Options) {
        const data = addBins_(this._data, key, newKey, nbBins, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    addOutliers(key: "string", newKey: "string", method: "boxplot", options: Options) {
        const data = addOutliers_(this._data, key, newKey, method, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    excludeOutliers(key: "string", method: "boxplot", options: Options) {
        const data = excludeOutliers_(this._data, key, method, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    correlation(key1: string, key2: string, options: Options) {
        const data = correlation_(this._data, key1, key2, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    addItems(dataToBeAdded: SimpleDataItem[], options: Options) {
        const data = addItems_(this._data, dataToBeAdded, { ...this._defaultOptions, ...options })
        this.#updateSimpleData(data)
        return this
    }

    summarize(value?: string, key?: string, summary?: any, weight?: string, options?: Options) {
        // Note that the parameters are in different order below
        const data = summarize_(
            this._data,
            key === undefined ? "no key" : key,
            // Everything except weightedMean
            summary === undefined ? ["count", "min", "max", "sum", "mean", "median", "deviation"] : summary,
            value === undefined ? this._keys : value,
            weight === undefined ? "no weight" : weight,
            { ...this._defaultOptions, ...options }
        )
        this.#updateSimpleData(data)
        return this
    }

    showTable(options: Options) {
        showTable_(this._data, { ...this._defaultOptions, ...options })
        return this
    }

}