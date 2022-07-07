import cloneDeep from "lodash.clonedeep"
import renameKey_ from "../methods/cleaning/renameKey.js"
import describe_ from "../methods/analyzing/describe.js"
import formatAllKeys_ from "../methods/cleaning/formatAllKeys.js"
import getArray_ from "../methods/exporting/getArray.js"
import getDataAsArrays_ from "../methods/exporting/getDataAsArrays.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/cleaning/checkValues.js"
import excludeMissingValues_ from "../methods/cleaning/excludeMissingValues.js"
import keepMissingValues_ from "../methods/cleaning/keepMissingValues.js"
import removeKey_ from "../methods/restructuring/removeKey.js"
import valuesToString_ from "../methods/cleaning/valuesToString.js"
import valuesToInteger_ from "../methods/cleaning/valuesToInteger.js"
import valuesToFloat_ from "../methods/cleaning/valuesToFloat.js"
import valuesToDate_ from "../methods/cleaning/valuesToDate.js"
import datesToString_ from "../methods/cleaning/datesToString.js"
import filterValues_ from "../methods/selecting/filterValues.js"
import filterItems_ from "../methods/selecting/filterItems.js"
import removeDuplicates_ from "../methods/cleaning/removeDuplicates.js"
import roundValues_ from "../methods/cleaning/roundValues.js"
import replaceStringValues_ from "../methods/cleaning/replaceStringValues.js"
import addKey_ from "../methods/restructuring/addKey.js"
import selectKeys_ from "../methods/selecting/selectKeys.js"
import modifyValues_ from "../methods/cleaning/modifyValues.js"
import modifyItems_ from "../methods/restructuring/modifyItems.js"
import sortValues_ from "../methods/analyzing/sortValues.js"
import addQuantiles_ from "../methods/analyzing/addQuantiles.js"
import addBins_ from "../methods/analyzing/addBins.js"
import addOutliers_ from "../methods/analyzing/addOutliers.js"
import excludeOutliers_ from "../methods/analyzing/excludeOutliers.js"
import correlation_ from "../methods/analyzing/correlation.js"
import addItems_ from "../methods/restructuring/addItems.js"
import getUniqueValues_ from "../methods/exporting/getUniqueValues.js"
import summarize_ from "../methods/analyzing/summarize.js"
import addPercentageDistribution_ from "../methods/analyzing/addPercentageDistribution.js"
import mergeItems_ from "../methods/restructuring/mergeItems.js"
import keysToValues_ from "../methods/restructuring/keysToValues.js"
import valuesToKeys_ from "../methods/restructuring/valuesToKeys.js"
import handleMissingKeys from "../helpers/handleMissingKeys.js"
import { logCall, asyncLogCall } from "../helpers/logCall.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import loadDataFromUrlWeb_ from "../methods/importing/loadDataFromUrlWeb.js"
import getChart_ from "../methods/visualizing/getChart.js"
import getCustomChart_ from "../methods/visualizing/getCustomChart.js"
import log from "../helpers/log.js"

/**
 * SimpleData usage example.
 *
 * ```typescript
 * const data = [{ key: value }, ...]
 * const simpleData = new SimplaData({ data: data })
 * ```
 */
export default class SimpleData {
    _data: SimpleDataItem[]
    _tempData: SimpleDataItem[]
    _overwrite: boolean
    _keys: string[]
    // Logging
    noLogs: boolean
    verbose: boolean
    logParameters: boolean
    nbTableItemsToLog: number

    /**
     * SimpleData constructor
     * @param __namedParameters.data  Data as a list of objects with the same keys.
     * @param __namedParameters.verbose  Log information in the console on `SimpleData` method calls.
     * @param __namedParameters.logParameters  If true, logs methods parameters on every call. Only applies when `verbose` is true.
     * @param __namedParameters.nbTableItemsToLog  Number of items to log in table. Only applies when `verbose` is true.
     * @param __namedParameters.fillMissingKeys  Fill missing keys with `undefined`.
     */
    constructor({
        data = [],
        verbose = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        noLogs = false,
    }: {
        data?: SimpleDataItem[]
        verbose?: boolean
        logParameters?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        noLogs?: boolean
    } = {}) {
        if (data.length > 0) {
            handleMissingKeys(
                data,
                fillMissingKeys,
                undefined,
                !noLogs && verbose
            )
        } else {
            !noLogs &&
                verbose &&
                log("\nnew SimpleData\nStarting an empty SimpleData")
        }

        this._data = data
        this._tempData = []
        this._overwrite = true
        this._keys = data[0] ? Object.keys(data[0]) : []

        this.verbose = !noLogs && verbose
        this.logParameters = logParameters
        this.nbTableItemsToLog = nbTableItemsToLog
        this.noLogs = noLogs
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
        const data = await loadDataFromUrlWeb_({
            url: url,
            verbose: this.verbose,
            missingKeyValues: missingKeyValues,
        })

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        handleMissingKeys(data, fillMissingKeys, undefined, this.verbose)

        this._tempData = data // important for decorator
        this.#updateSimpleData(data)

        return this
    }

    // CLEANING METHODS //

    @logCall()
    describe({ overwrite = true }: { overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = describe_(cloneDeep(this._data))
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    checkValues({ overwrite = true }: { overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = checkValues_(cloneDeep(this._data))
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        if (missingValues === undefined) {
            missingValues = [null, NaN, undefined, ""]
        }
        this._tempData = excludeMissingValues_(
            cloneDeep(this._data),
            key,
            missingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    keepMissingValues({
        key,
        missingValues,
        overwrite = true,
    }: {
        key?: string
        missingValues?: SimpleDataValue[]
        overwrite?: boolean
    } = {}): this {
        this._overwrite = overwrite
        if (missingValues === undefined) {
            missingValues = [null, NaN, undefined, ""]
        }
        this._tempData = keepMissingValues_(
            cloneDeep(this._data),
            key,
            missingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    formatAllKeys({ overwrite = true }: { overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = formatAllKeys_(cloneDeep(this._data), this.verbose)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = renameKey_(cloneDeep(this._data), oldKey, newKey)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = valuesToString_(cloneDeep(this._data), key)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    valuesToInteger({
        key,
        language = "en",
        overwrite = true,
    }: {
        key: string
        language?: "en" | "fr"
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToInteger_(cloneDeep(this._data), key, language)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    valuesToFloat({
        key,
        language = "en",
        overwrite = true,
    }: {
        key: string
        language?: "en" | "fr"
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToFloat_(cloneDeep(this._data), key, language)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = valuesToDate_(cloneDeep(this._data), key, format)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = datesToString_(cloneDeep(this._data), key, format)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = roundValues_(cloneDeep(this._data), key, nbDigits)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    replaceStringValues({
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
        this._overwrite = overwrite
        this._tempData = replaceStringValues_(
            cloneDeep(this._data),
            key,
            oldValue,
            newValue,
            method
        )

        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = modifyValues_(
            cloneDeep(this._data),
            key,
            valueGenerator
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = modifyItems_(cloneDeep(this._data), key, itemGenerator)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = excludeOutliers_(
            cloneDeep(this._data),
            key,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = removeKey_(cloneDeep(this._data), key)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    addKey({
        key,
        itemGenerator,
        overwrite = true,
    }: {
        key: string
        itemGenerator: (item: SimpleDataItem) => SimpleDataValue
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = addKey_(cloneDeep(this._data), key, itemGenerator)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    addItems({
        dataToBeAdded,
        fillMissingValues = false,
        overwrite = true,
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData
        fillMissingValues?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = addItems_(
            cloneDeep(this._data),
            dataToBeAdded,
            fillMissingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = mergeItems_(
            cloneDeep(this._data),
            dataToBeMerged,
            commonKey,
            this.verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    valuesToKeys({
        newKeys,
        newValues,
        overwrite = true,
    }: {
        newKeys: string
        newValues: string
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToKeys_(
            cloneDeep(this._data),
            newKeys,
            newValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    keysToValues({
        keys,
        newKeyForKeys,
        newKeyForValues,
        overwrite = true,
    }: {
        keys: string[]
        newKeyForKeys: string
        newKeyForValues: string
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = keysToValues_(
            cloneDeep(this._data),
            keys,
            newKeyForKeys,
            newKeyForValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = selectKeys_(cloneDeep(this._data), keys)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = filterValues_(
            cloneDeep(this._data),
            key,
            valueComparator,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = filterItems_(
            cloneDeep(this._data),
            itemComparator,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    removeDuplicates({
        key,
        overwrite = true,
    }: { key?: string; overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = removeDuplicates_(
            cloneDeep(this._data),
            key,
            this.verbose || !this._overwrite
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    // *** ANALYSIS METHODS *** //

    @logCall()
    sortValues({
        key,
        order = "ascending",
        overwrite = true,
        locale = "fr",
        nbTestedValue = 10000,
    }: {
        key: string
        order: "ascending" | "descending"
        overwrite?: boolean
        locale?: string
        nbTestedValue?: number
    }): this {
        this._overwrite = overwrite
        this._tempData = sortValues_(
            cloneDeep(this._data),
            key,
            order,
            locale,
            nbTestedValue,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    addPercentageDistribution({
        method,
        key,
        keys,
        newKey,
        groupKeys,
        suffix,
        nbDigits = 2,
        nbTestedValues = 10000,
        overwrite = true,
    }: {
        method: "item" | "data"
        key?: string
        keys?: string[]
        newKey?: string
        groupKeys?: string | string[]
        suffix?: string
        nbDigits?: number
        nbTestedValues?: number
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = addPercentageDistribution_(cloneDeep(this._data), {
            method,
            keys,
            key,
            newKey,
            groupKeys,
            suffix,
            nbDigits,
            nbTestedValues,
            verbose: this.verbose,
        })
        overwrite && this.#updateSimpleData(this._tempData)
        return this
    }

    @logCall()
    summarize({
        keyValue,
        keyCategory,
        summary,
        weight,
        overwrite = true,
        nbDigits = 1,
    }: {
        keyValue?: string | string[]
        keyCategory?: string | string[]
        summary?: string | string[]
        weight?: string
        overwrite?: boolean
        nbDigits?: number
    } = {}): this {
        this._overwrite = overwrite
        this._tempData = summarize_(
            cloneDeep(this._data),
            keyValue,
            keyCategory,
            summary,
            weight,
            this.verbose,
            nbDigits
        )
        overwrite && this.#updateSimpleData(this._tempData)
        return this
    }

    @logCall()
    correlation({
        key1,
        key2,
        overwrite = true,
        nbValuesTestedForTypeOf = 10000,
    }: {
        key1?: string
        key2?: string
        overwrite?: boolean
        nbDigits?: number
        nbValuesTestedForTypeOf?: number
    } = {}): this {
        this._overwrite = overwrite
        this._tempData = correlation_(
            cloneDeep(this._data),
            key1,
            key2,
            this.verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = addQuantiles_(
            cloneDeep(this._data),
            key,
            newKey,
            nbQuantiles
        )
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = addBins_(cloneDeep(this._data), key, newKey, nbBins)
        overwrite && this.#updateSimpleData(this._tempData)

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
        this._overwrite = overwrite
        this._tempData = addOutliers_(
            cloneDeep(this._data),
            key,
            newKey,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    // *** VISUALIZATION METHODS *** //

    @logCall()
    getChart({
        type,
        x,
        y,
        color,
        trend = false,
        marginLeft,
        marginBottom,
    }: {
        type:
            | "dot"
            | "line"
            | "bar"
            | "barVertical"
            | "barHorizontal"
            | "box"
            | "boxVertical"
            | "boxHorizontal"
        x: string
        y: string
        color?: string
        trend?: boolean
        marginLeft?: number
        marginBottom?: number
    }): string {
        const chart = getChart_(
            cloneDeep(this._data),
            type,
            x,
            y,
            color,
            trend,
            this.verbose,
            marginLeft,
            marginBottom
        )
        return chart
    }

    @logCall()
    getCustomChart({ plotOptions }: { plotOptions: object }): string {
        const chart = getCustomChart_(plotOptions, this.verbose)
        return chart
    }

    // ** EXPORTING METHODS *** //

    @logCall()
    clone(): this {
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

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getArray({ key }: { key: string }): SimpleDataValue[] {
        const array = getArray_(this._data, key)

        return array
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getDataAsArrays() {
        const arrays = getDataAsArrays_(this._data)

        return arrays
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getUniqueValues({ key }: { key: string }): SimpleDataValue[] {
        const uniqueValues = getUniqueValues_(this._data, key)

        return uniqueValues
    }

    // *** LOGGING METHODS AND OTHERS *** //

    // No log call, otherwise the table is shown twice.
    showTable({
        nbItemInTable = 5,
    }: { nbItemInTable?: "all" | number } = {}): this {
        if (!this.noLogs) {
            // TODO: test this!
            showTable_(this._data, nbItemInTable, true)
        }
        return this
    }
}
