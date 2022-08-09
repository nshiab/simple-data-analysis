import cloneDeep from "lodash.clonedeep"
import renameKey_ from "../methods/cleaning/renameKey.js"
import describe_ from "../methods/analyzing/describe.js"
import formatAllKeys_ from "../methods/cleaning/formatAllKeys.js"
import getItem_ from "../methods/exporting/getItem.js"
import getArray_ from "../methods/exporting/getArray.js"
import getMin_ from "../methods/exporting/getMin.js"
import getMax_ from "../methods/exporting/getMax.js"
import getMean_ from "../methods/exporting/getMean.js"
import getMedian_ from "../methods/exporting/getMedian.js"
import getSum_ from "../methods/exporting/getSum.js"
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
import keepDuplicates_ from "../methods/cleaning/keepDuplicates.js"
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
import excludeOutliers_ from "../methods/analyzing/excludeOutliers.js"
import correlation_ from "../methods/analyzing/correlation.js"
import addItems_ from "../methods/restructuring/addItems.js"
import getUniqueValues_ from "../methods/exporting/getUniqueValues.js"
import summarize_ from "../methods/analyzing/summarize.js"
import addProportions_ from "../methods/analyzing/addProportions.js"
import addVariation_ from "../methods/analyzing/addVariation.js"
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
import arraysToData from "../helpers/arraysToData.js"

/**
 * SimpleData usage example.
 *
 * ```typescript
 * const data = [{ key: value }, ...]
 * const simpleData = new SimpleData({ data: data })
 * ```
 */
export default class SimpleData {
    _data: SimpleDataItem[]
    _tempData: SimpleDataItem[]
    _overwrite: boolean
    _duration: number
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
        dataAsArrays = false,
        verbose = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        noLogs = false,
        firstItem = 0,
        lastItem = Infinity,
        duration = 0,
    }: {
        data?: SimpleDataItem[] | { [key: string]: SimpleDataValue[] }
        dataAsArrays?: boolean
        verbose?: boolean
        logParameters?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        noLogs?: boolean
        firstItem?: number
        lastItem?: number
        duration?: 0
    } = {}) {
        if (data.length > 0 || Object.keys(data).length > 0) {
            const incomingData = dataAsArrays
                ? cloneDeep(
                      arraysToData(
                          data as unknown as {
                              [key: string]: SimpleDataValue[]
                          }
                      ).slice(firstItem, lastItem + 1)
                  )
                : cloneDeep(
                      (data as SimpleDataItem[]).slice(firstItem, lastItem + 1)
                  )

            handleMissingKeys(
                incomingData,
                fillMissingKeys,
                undefined,
                !noLogs && verbose
            )

            this._data = incomingData
        } else {
            !noLogs &&
                verbose &&
                log("\nnew SimpleData\nStarting an empty SimpleData")

            this._data = []
        }

        this._tempData = []
        this._overwrite = true
        this._duration = duration

        this.verbose = !noLogs && verbose
        this.logParameters = logParameters
        this.nbTableItemsToLog = nbTableItemsToLog
        this.noLogs = noLogs
    }

    // If modified, needs to be modified in SimpleDataNode
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
    }

    // *** IMPORTING METHOD *** //

    @asyncLogCall()
    async loadDataFromUrl({
        url,
        autoType = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        dataAsArrays = false,
        firstItem = 0,
        lastItem = Infinity,
    }: {
        url: string
        autoType?: boolean
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        dataAsArrays?: boolean
        firstItem?: number
        lastItem?: number
    }): Promise<this> {
        const data = await loadDataFromUrlWeb_(
            url,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            missingKeyValues,
            this.verbose
        )

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
    checkValues({
        nbItemsToCheck = "all",
        randomize = false,
        overwrite = true,
    }: {
        nbItemsToCheck?: "all" | number
        randomize?: boolean
        overwrite?: boolean
    } = {}): this {
        this._overwrite = overwrite
        this._tempData = checkValues_(
            cloneDeep(this._data),
            nbItemsToCheck,
            randomize
        )
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
        thousandSeparator = ",",
        decimalSeparator = ".",
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        thousandSeparator?: string
        decimalSeparator?: string
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToInteger_(
            cloneDeep(this._data),
            key,
            thousandSeparator,
            decimalSeparator,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    valuesToFloat({
        key,
        thousandSeparator = ",",
        decimalSeparator = ".",
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        thousandSeparator?: string
        decimalSeparator?: string
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToFloat_(
            cloneDeep(this._data),
            key,
            thousandSeparator,
            decimalSeparator,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    valuesToDate({
        key,
        format,
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        format: string
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = valuesToDate_(
            cloneDeep(this._data),
            key,
            format,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    datesToString({
        key,
        format,
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        format: string
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = datesToString_(
            cloneDeep(this._data),
            key,
            format,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    roundValues({
        key,
        nbDigits = 1,
        overwrite = true,
        skipErrors = false,
    }: {
        key: string
        nbDigits?: number
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = roundValues_(
            cloneDeep(this._data),
            key,
            nbDigits,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    replaceValues({
        key,
        oldValue,
        newValue,
        method = undefined,
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        oldValue: string
        newValue: string
        method?: undefined | "entireString" | "partialString"
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = replaceValues_(
            cloneDeep(this._data),
            key,
            oldValue,
            newValue,
            method,
            skipErrors
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
        fillMissingKeys = false,
        overwrite = true,
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData
        fillMissingKeys?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = addItems_(
            cloneDeep(this._data),
            dataToBeAdded,
            fillMissingKeys,
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
        nbToKeep = 1,
        overwrite = true,
    }: {
        key?: string
        nbToKeep?: number
        overwrite?: boolean
    } = {}): this {
        this._overwrite = overwrite
        this._tempData = removeDuplicates_(
            cloneDeep(this._data),
            key,
            nbToKeep,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    keepDuplicates({
        key,
        overwrite = true,
    }: { key?: string; overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = keepDuplicates_(
            cloneDeep(this._data),
            key,
            this.verbose
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
        key: string | string[]
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
            nbTestedValue
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @logCall()
    addProportions({
        method,
        key,
        keys,
        newKey,
        keyCategory,
        suffix,
        nbDigits = 2,
        nbTestedValues = 10000,
        overwrite = true,
    }: {
        method: "item" | "data"
        key?: string
        keys?: string[]
        newKey?: string
        keyCategory?: string | string[]
        suffix?: string
        nbDigits?: number
        nbTestedValues?: number
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = addProportions_(cloneDeep(this._data), {
            method,
            keys,
            key,
            newKey,
            keyCategory,
            suffix,
            nbDigits,
            nbTestedValues,
            verbose: this.verbose,
        })
        overwrite && this.#updateSimpleData(this._tempData)
        return this
    }

    @logCall()
    addVariation({
        key,
        newKey,
        valueGenerator,
        order = undefined,
        firstValue = undefined,
        overwrite = true,
    }: {
        key: string
        newKey: string
        valueGenerator: (
            a: SimpleDataValue,
            b: SimpleDataValue
        ) => SimpleDataValue
        order?: "ascending" | "descending" | undefined
        firstValue?: SimpleDataValue
        overwrite?: boolean
    }) {
        this._overwrite = overwrite
        this._tempData = addVariation_(
            cloneDeep(this._data),
            key,
            newKey,
            valueGenerator,
            order,
            firstValue
        )
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
        showTrendEquation = false,
        width,
        height,
        marginLeft,
        marginBottom,
        title,
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
        showTrendEquation?: boolean
        width?: number
        height?: number
        marginLeft?: number
        marginBottom?: number
        title?: string
    }): string {
        const chart = getChart_(
            cloneDeep(this._data),
            type,
            x,
            y,
            color,
            trend,
            showTrendEquation,
            marginLeft,
            marginBottom,
            width,
            height,
            title
        )
        return chart
    }

    @logCall()
    getCustomChart({ plotOptions }: { plotOptions: object }): string {
        const chart = getCustomChart_(plotOptions)
        return chart
    }

    // ** EXPORTING METHODS *** //

    @logCall()
    clone(): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new this.constructor({
            data: this._data,
            verbose: this.verbose,
            logParameters: this.logParameters,
            noLogs: this.noLogs,
            nbTableItemsToLog: this.nbTableItemsToLog,
            duration: this._duration,
        })
    }

    // No @logCall otherwise it's triggered everywhere, including in methods
    getData(): SimpleDataItem[] {
        return this._data
    }

    getLength(): number {
        return this._data.length
    }

    //No @logCall otherwise it's triggered everywhere, including in methods
    getKeys(): string[] {
        return Object.keys(this._data[0])
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getItem({
        conditions,
        noWarning = false,
    }: {
        conditions: SimpleDataItem
        noWarning?: boolean
    }): SimpleDataItem | undefined {
        const item = getItem_(this._data, conditions, noWarning)
        return item
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getArray({ key }: { key: string | string[] }): SimpleDataValue[] {
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

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMin({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return getMin_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMax({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return getMax_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMean({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return getMean_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMedian({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return getMedian_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getSum({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return getSum_(this._data, key, nbDigits)
    }

    getDuration() {
        return this._duration
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

    showDuration() {
        if (!this.noLogs) {
            log(`Total duration ${(this._duration / 1000).toFixed(3)}.`)
        }
        return this
    }
}
