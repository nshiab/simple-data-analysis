import cloneDeep from "lodash.clonedeep"
import renameKey_ from "../methods/cleaning/renameKey.js"
import describe_ from "../methods/cleaning/describe.js"
import formatAllKeys_ from "../methods/cleaning/formatAllKeys.js"
import getArray_ from "../methods/exporting/getArray.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/cleaning/checkValues.js"
import excludeMissingValues_ from "../methods/cleaning/excludeMissingValues.js"
import removeKey_ from "../methods/restructuring/removeKey.js"
import valuesToString_ from "../methods/cleaning/valuesToString.js"
import valuesToInteger_ from "../methods/cleaning/valuesToInteger.js"
import valuesToFloat_ from "../methods/cleaning/valuesToFloat.js"
import valuesToDate_ from "../methods/cleaning/valuesToDate.js"
import datesToString_ from "../methods/cleaning/datesToString.js"
import filterValues_ from "../methods/selecting/filterValues.js"
import filterItems_ from "../methods/selecting/filterItems.js"
import roundValues_ from "../methods/cleaning/roundValues.js"
import replaceValues_ from "../methods/cleaning/replaceValues.js"
import addKey_ from "../methods/restructuring/addKey.js"
import selectKeys_ from "../methods/selecting/selectKeys.js"
import modifyValues_ from "../methods/cleaning/modifyValues.js"
import modifyItems_ from "../methods/cleaning/modifyItems.js"
import sortValues_ from "../methods/analyzing/sortValues.js"
import addQuantiles_ from "../methods/analyzing/addQuantiles.js"
import addBins_ from "../methods/analyzing/addBins.js"
import addOutliers_ from "../methods/analyzing/addOutliers.js"
import excludeOutliers_ from "../methods/cleaning/excludeOutliers.js"
import correlation_ from "../methods/analyzing/correlation.js"
import addItems_ from "../methods/restructuring/addItems.js"
import getUniqueValues_ from "../methods/exporting/getUniqueValues.js"
import summarize_ from "../methods/analyzing/summarize.js"
import mergeItems_ from "../methods/restructuring/mergeItems.js"
import checkKeys from "../helpers/checkKeys.js"
import { logCall, asyncLogCall } from "../helpers/logCall.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import loadDataFromUrl_ from "../methods/importing/loadDataFromUrl.js"
import getChart_ from "../methods/visualizing/getChart.js"
import getCustomChart_ from "../methods/visualizing/getCustomChart.js"
import log from "../helpers/log.js"

export default class SimpleData {
    _data: SimpleDataItem[]
    _keys: string[]
    // Logging
    verbose: boolean
    logParameters: boolean
    nbTableItemsToLog: number

    constructor({
        data = [],
        verbose = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
    }: {
        data?: SimpleDataItem[]
        verbose?: boolean
        logParameters?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
    } = {}) {
        if (data.length > 0) {
            checkKeys(data, fillMissingKeys, verbose)
        } else if (data.length === 0) {
            verbose && log("\nnew SimpleDAta\nStarting an empty SimpleData")
        }

        this._data = data
        this._keys = data[0] ? Object.keys(data[0]) : []

        this.verbose = verbose
        this.logParameters = logParameters
        this.nbTableItemsToLog = nbTableItemsToLog
    }

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    // *** IMPORTING METHOD *** //

    @asyncLogCall()
    async loadDataFromUrl({
        url,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
    }: {
        url: string
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
    }): Promise<this> {
        const data = await loadDataFromUrl_({
            url: url,
            verbose: this.verbose,
            missingKeyValues: missingKeyValues,
        })

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        checkKeys(data, fillMissingKeys, this.verbose)

        this.#updateSimpleData(data)

        return this
    }

    // CLEANING METHODS //

    @logCall()
    describe({ overwrite = false }: { overwrite?: boolean } = {}): this {
        const data = describe_(this._data)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    checkValues({ overwrite = false }: { overwrite?: boolean } = {}): this {
        const data = checkValues_(this._data)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeMissingValues({
        key,
        missingValues,
        overwrite = true,
    }: {
        key?: string
        missingValues?: SimpleDataValue[]
        overwrite?: boolean
    } = {}): this {
        if (missingValues === undefined) {
            missingValues = [null, NaN, undefined, ""]
        }
        const data = excludeMissingValues_(
            this._data,
            key,
            missingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    formatAllKeys({ overwrite = true }: { overwrite?: boolean } = {}): this {
        const data = formatAllKeys_(this._data, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    renameKey({
        oldKey,
        newKey,
        overwrite = true,
    }: {
        oldKey: string
        newKey: string
        overwrite?: boolean
    }): this {
        const data = renameKey_(this._data, oldKey, newKey)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToString({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        const data = valuesToString_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToInteger({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        const data = valuesToInteger_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToFloat({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        const data = valuesToFloat_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToDate({
        key,
        format,
        overwrite = true,
    }: {
        key: string
        format: string
        overwrite?: boolean
    }): this {
        const data = valuesToDate_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    datesToString({
        key,
        format,
        overwrite = true,
    }: {
        key: string
        format: string
        overwrite?: boolean
    }): this {
        const data = datesToString_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    roundValues({
        key,
        nbDigits = 1,
        overwrite = true,
    }: {
        key: string
        nbDigits?: number
        overwrite?: boolean
    }): this {
        const data = roundValues_(this._data, key, nbDigits)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    replaceValues({
        key,
        oldValue,
        newValue,
        method = "entireString",
        overwrite = true,
    }: {
        key: string
        oldValue: string
        newValue: string
        method: "entireString" | "partialString"
        overwrite?: boolean
    }): this {
        const data = replaceValues_(this._data, key, oldValue, newValue, method)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyValues({
        key,
        valueGenerator,
        overwrite = true,
    }: {
        key: string
        valueGenerator: (val: SimpleDataValue) => SimpleDataValue
        overwrite?: boolean
    }): this {
        const data = modifyValues_(this._data, key, valueGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyItems({
        key,
        itemGenerator,
        overwrite = true,
    }: {
        key: string
        itemGenerator: (item: SimpleDataItem) => SimpleDataValue
        overwrite?: boolean
    }): this {
        const data = modifyItems_(this._data, key, itemGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeOutliers({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        const data = excludeOutliers_(this._data, key, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    // *** RESTRUCTURING METHODS *** //

    @logCall()
    removeKey({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        const data = removeKey_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addKey({
        key,
        valueGenerator,
        overwrite = true,
    }: {
        key: string
        valueGenerator: (item: SimpleDataItem) => SimpleDataValue
        overwrite?: boolean
    }): this {
        const data = addKey_(this._data, key, valueGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addItems({
        dataToBeAdded,
        overwrite = true,
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData
        nbDigits?: number
        overwrite?: boolean
    }): this {
        const data = addItems_(this._data, dataToBeAdded, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    mergeItems({
        dataToBeMerged,
        commonKey,
        nbValuesTestedForTypeOf = 10000,
        overwrite = true,
    }: {
        dataToBeMerged: SimpleDataItem[] | SimpleData
        commonKey: string
        nbValuesTestedForTypeOf?: number
        overwrite?: boolean
    }): this {
        const data = mergeItems_(
            this._data,
            dataToBeMerged,
            commonKey,
            this.verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    //*** SELECTION METHODS ***/

    @logCall()
    selectKeys({
        keys,
        overwrite = true,
    }: {
        keys: string[]
        overwrite?: boolean
    }): this {
        const data = selectKeys_(this._data, keys)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterValues({
        key,
        valueComparator,
        overwrite = true,
    }: {
        key: string
        valueComparator: (val: SimpleDataValue) => SimpleDataValue
        overwrite?: boolean
    }): this {
        const data = filterValues_(
            this._data,
            key,
            valueComparator,
            this.verbose
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterItems({
        itemComparator,
        overwrite = true,
    }: {
        itemComparator: (val: SimpleDataItem) => boolean
        overwrite?: boolean
    }): this {
        const data = filterItems_(this._data, itemComparator, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    // *** ANALYSIS METHODS *** //

    @logCall()
    sortValues({
        key,
        order,
        overwrite = true,
    }: {
        key: string
        order: "ascending" | "descending"
        overwrite?: boolean
    }): this {
        const data = sortValues_(this._data, key, order)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    summarize({
        keyValue,
        keyCategory,
        summary,
        weight,
        overwrite = false,
        nbDigits = 1,
        nbValuesTestedForTypeOf = 1000,
    }: {
        keyValue?: string | string[]
        keyCategory?: string | string[]
        summary?: string | string[]
        weight?: string
        overwrite?: boolean
        nbDigits?: number
        nbValuesTestedForTypeOf?: number
    } = {}): this {
        const data = summarize_(
            this._data,
            keyValue === undefined ? this._keys : keyValue,
            this.verbose,
            nbValuesTestedForTypeOf,
            nbDigits,
            keyCategory,
            summary,
            weight
        )
        overwrite && this.#updateSimpleData(data)
        return this
    }

    @logCall()
    correlation({
        key1,
        key2,
        overwrite = false,
        nbValuesTestedForTypeOf = 10000,
    }: {
        key1?: string
        key2?: string
        overwrite?: boolean
        nbDigits?: number
        nbValuesTestedForTypeOf?: number
    } = {}): this {
        const data = correlation_(
            this._data,
            this.verbose,
            nbValuesTestedForTypeOf,
            key1,
            key2
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addQuantiles({
        key,
        newKey,
        nbQuantiles,
        overwrite = true,
    }: {
        key: string
        newKey: string
        nbQuantiles: number
        overwrite?: boolean
    }): this {
        const data = addQuantiles_(this._data, key, newKey, nbQuantiles)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addBins({
        key,
        newKey,
        nbBins,
        overwrite = true,
    }: {
        key: string
        newKey: string
        nbBins: number
        overwrite?: boolean
    }): this {
        const data = addBins_(this._data, key, newKey, nbBins)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addOutliers({
        key,
        newKey,
        overwrite = true,
    }: {
        key: string
        newKey: string
        overwrite?: boolean
    }): this {
        const data = addOutliers_(this._data, key, newKey, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    // *** VISUALIZATION METHODS *** //

    @logCall()
    getChart({
        type,
        x,
        y,
        color,
    }: {
        type: "dot" | "line" | "bar" | "box"
        x: string
        y: string
        color?: string
    }): string {
        const chart = getChart_(this._data, type, x, y, color)
        return chart
    }

    @logCall()
    getCustomChart({ plotOptions }: { plotOptions: object }): string {
        const chart = getCustomChart_(plotOptions)
        return chart
    }

    // ** EXPORTING METHODS *** //

    @logCall()
    clone(): SimpleData {
        const newSimpleData = cloneDeep(this)

        return newSimpleData
    }

    // No @logCall otherwise it's triggered everywhere, including in methods
    getData(): SimpleDataItem[] {
        return this._data
    }

    //No @logCall otherwise it's triggered everywhere, including in methods
    getKeys(): string[] {
        return this._keys
    }

    @logCall()
    getArray({ key }: { key: string }): SimpleDataValue[] {
        const array = getArray_(this._data, key)

        return array
    }

    @logCall()
    getUniqueValues({ key }: { key: string }): SimpleDataValue[] {
        const uniqueValues = getUniqueValues_(this._data, key)

        return uniqueValues
    }

    // *** LOGGING METHODS AND OTHERS *** //

    @logCall()
    showTable({
        nbItemInTable = 5,
    }: { nbItemInTable?: "all" | number } = {}): this {
        // TODO: test this!
        showTable_(this._data, nbItemInTable)

        return this
    }
}
