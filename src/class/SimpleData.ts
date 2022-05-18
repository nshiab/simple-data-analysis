import cloneDeep from "lodash.clonedeep"
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
import mergeItems_ from "../methods/mergeItems.js"
import saveData_ from "../methods/saveData.js"
import saveChart_ from "../methods/saveChart.js"
import saveCustomChart_ from "../methods/saveCustomChart.js"
import checkKeys from "../helpers/checkKeys.js"
import { SimpleDataItem, Options, partialOptions, defaultOptions } from "../types/SimpleData.types"
import getParametersAndOptions from "../helpers/getParametersAndOptions.js"
import logInfos from "../helpers/logInfos.js"
import { floor } from "lodash"




export default class SimpleData {

    _data: SimpleDataItem[]
    _keys: string[]
    _options: Options

    constructor(incomingData: SimpleDataItem[], options?: partialOptions) {
        checkKeys(incomingData)
        this._data = incomingData
        this._keys = Object.keys(incomingData[0])

        if (options === undefined){
            this._options = defaultOptions
        } else {
            this._options = { ...defaultOptions, ...options }
        }
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
        return this._options
    }
    set options(options: partialOptions) {
        this._options = { ...this._options, ...options }
    }

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    // #apply(func: (data: SimpleDataItem[], ...args: any[]) => any, ...args: any[]) {

    //     const { parameters, options } = getParametersAndOptions(this._options, ...args)

    //     const data = func(this._data, ...parameters)

    //     return options.showDataNoOverwrite ? this._data : data
    // }

    @logInfos()
    clone() {
        const newSimpleData = cloneDeep(this)

        return newSimpleData
    }

    @logInfos()
    getArray(key: string) {
        const data = getArray_(this.data, key)

        return data
    }

    @logInfos()
    getUniqueValues(key: string) {
        const data = getUniqueValues_(this.data, key)
        return data
    }

    @logInfos()
    checkValues() {
        // TODO: can we overwrite data?
        // TODO: test this function.
        checkValues_(this.data)
        return this
    }

    @logInfos()
    excludeMissingValues(key?: string) {
        const data = excludeMissingValues_(
            this.data, 
            key,
            this._options.missingValuesArray,
            this._options.logs
        )
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    describe() {
        // TODO: can we overwrite data?
        // TODO: test this function.
        describe_(this.data)
        return this
    }

    @logInfos()
    renameKey(oldKey: string, newKey: string) {
        const data = renameKey_(this._data, oldKey, newKey)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    removeKey(key: string) {
        const data = removeKey_(this._data, key)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    addKey(key: string, func: (item: any) => any) {
        const data = addKey_(this._data, key, func)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    selectKeys(keys: string[]) {
        const data = selectKeys_(this._data, keys)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    modifyValues(key: string, func: (val: any) => any) {
        const data = modifyValues_(this._data, key, func)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    modifyItems(key: string, func: (item: any) => any) {
        const data = modifyItems_(this._data, key, func)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    formatAllKeys() {
        const data = formatAllKeys_(this._data, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    valuesToString(key: string) {
        const data = valuesToString_(this._data, key)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    valuesToInteger(key: string) {
        const data = valuesToInteger_(this._data, key)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    valuesToFloat(key: string) {
        const data = valuesToFloat_(this._data, key)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    valuesToDate(key: string, format: string) {
        const data = valuesToDate_(this._data, key, format)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    datesToString(key: string, format: string) {
        const data = datesToString_(this._data, key, format)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    filterValues(key: string, func: (val: any) => any) {
        const data = filterValues_(this._data, key, func, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    filterItems(func: (val: any) => any) {
        const data = filterItems_(this._data, func, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    roundValues(key: string) {
        const data = roundValues_(this._data, key, this._options.fractionDigits)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    replaceValues(key: string, oldValue: string, newValue: string, method: "entireString" | "partialString") {
        const data = replaceValues_(this._data, key, oldValue, newValue, method)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    sortValues(key: string, order: "ascending" | "descending") {
        const data = sortValues_(this._data, key, order)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    addQuantiles(key: string, newKey: string, nbQuantiles: number) {
        const data = addQuantiles_(this._data, key, newKey, nbQuantiles, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    addBins(key: string, newKey: string, nbBins: number) {
        const data =  addBins_(this._data, key, newKey, nbBins, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    addOutliers(key: string, newKey: string) {
        const data = addOutliers_(this._data, key, newKey, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    excludeOutliers(key: string) {
        const data = excludeOutliers_(this._data, key, this._options.logs)
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    correlation(key1?: string, key2?: string) {
        const data = correlation_(
            this._data,
            this._options.logs,
            this._options.fractionDigits,
            this._options.nbValuesTestedForTypeOf, 
            key1,
            key2,
        )
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    addItems(dataToBeAdded: SimpleDataItem[]) {
        const data = addItems_(
            this._data, 
            dataToBeAdded, 
            this._options.logs,
            this._options.fractionDigits
        )
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    mergeItems(dataToBeMerged: SimpleDataItem[], commonKey: string) {
        const data = mergeItems_(
            this._data,
            dataToBeMerged,
            commonKey,
            this._options.logs,
            this._options.nbValuesTestedForTypeOf
        )
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    summarize(value?: string, key?: string, summary?: any, weight?: string) {
        const data = summarize_(
            this._data,
            value === undefined ? this._keys : value,
            key,
            summary,
            weight,
            this._options.logs, 
            this._options.nbValuesTestedForTypeOf, 
            this._options.fractionDigits
        )
        this.#updateSimpleData(data)
        return this
    }

    @logInfos()
    saveData(path: string) {
        saveData_(
            this._data, 
            path, 
            this._options.logs, 
            this._options.encoding,  
            this._options.environment
        )
        return this
    }

    // saveChart(path: string, type: "dot" | "line" | "bar" | "box", x: string, y: string, color?: string, options?: Options) {
    //     // We deal with the parameters manually to deal with optional arguments
    //     // We don't update data
    //     // This function return svg or html
    //     const chart = this.#apply(
    //         saveChart_,
    //         path,
    //         type,
    //         x,
    //         y,
    //         color,
    //         options === undefined ? this._defaultOptions : options
    //     )
    //     return chart
    // }

    // saveCustomChart(path: string, observablePlot: any, options?: Options) {
    //     // We deal with the parameters manually to deal with optional arguments
    //     // We don't update data
    //     // This function return svg or html
    //     const chart = this.#apply(
    //         saveCustomChart_,
    //         path,
    //         observablePlot,
    //         options === undefined ? this._defaultOptions : options
    //     )
    //     return chart
    // }

    @logInfos()
    showTable() {
        // TODO: test this!
        showTable_(this._data, this._options.nbItemInTable)
        return this
    }

}