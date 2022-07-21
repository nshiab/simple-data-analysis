import cloneDeep from "lodash.clonedeep"

import { SimpleDataItem, SimpleDataValue } from "../types/index.js"
import analyzing from "../methods/analyzing/index.js"
import cleaning from "../methods/cleaning/index.js"
import exporting from "../methods/exporting/index.js"
import importing from "../methods/importing/index.js"
import restructuring from "../methods/restructuring/index.js"
import selecting from "../methods/selecting/index.js"
import visualizing from "../methods/visualizing/index.js"
import methods from "../methods/index.js"
import helpers from "../helpers/index.js"

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
                      helpers
                          .arraysToData(
                              data as unknown as {
                                  [key: string]: SimpleDataValue[]
                              }
                          )
                          .slice(firstItem, lastItem + 1)
                  )
                : cloneDeep(
                      (data as SimpleDataItem[]).slice(firstItem, lastItem + 1)
                  )

            helpers.handleMissingKeys(
                incomingData,
                fillMissingKeys,
                undefined,
                !noLogs && verbose
            )

            this._data = incomingData
        } else {
            !noLogs &&
                verbose &&
                helpers.log("\nnew SimpleData\nStarting an empty SimpleData")

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

    @helpers.asyncLogCall()
    async loadDataFromUrl({
        url,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        dataAsArrays = false,
        firstItem = 0,
        lastItem = Infinity,
    }: {
        url: string
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        dataAsArrays?: boolean
        firstItem?: number
        lastItem?: number
    }): Promise<this> {
        const data = await importing.loadDataFromUrlWeb_(
            url,
            dataAsArrays,
            firstItem,
            lastItem,
            missingKeyValues,
            this.verbose
        )

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        helpers.handleMissingKeys(
            data,
            fillMissingKeys,
            undefined,
            this.verbose
        )

        this._tempData = data // important for decorator
        this.#updateSimpleData(data)

        return this
    }

    // CLEANING METHODS //

    @helpers.logCall()
    describe({ overwrite = true }: { overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = analyzing.describe_(cloneDeep(this._data))
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.checkValues_(
            cloneDeep(this._data),
            nbItemsToCheck,
            randomize
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.excludeMissingValues_(
            cloneDeep(this._data),
            key,
            missingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.keepMissingValues_(
            cloneDeep(this._data),
            key,
            missingValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    formatAllKeys({ overwrite = true }: { overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = cleaning.formatAllKeys_(
            cloneDeep(this._data),
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.renameKey_(
            cloneDeep(this._data),
            oldKey,
            newKey
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    valuesToString({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = cleaning.valuesToString_(cloneDeep(this._data), key)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    valuesToInteger({
        key,
        language = "en",
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        language?: "en" | "fr"
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = cleaning.valuesToInteger_(
            cloneDeep(this._data),
            key,
            language,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    valuesToFloat({
        key,
        language = "en",
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        language?: "en" | "fr"
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = cleaning.valuesToFloat_(
            cloneDeep(this._data),
            key,
            language,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.valuesToDate_(
            cloneDeep(this._data),
            key,
            format,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.datesToString_(
            cloneDeep(this._data),
            key,
            format,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.roundValues_(
            cloneDeep(this._data),
            key,
            nbDigits,
            skipErrors
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    replaceStringValues({
        key,
        oldValue,
        newValue,
        method = "entireString",
        skipErrors = false,
        overwrite = true,
    }: {
        key: string
        oldValue: string
        newValue: string
        method: "entireString" | "partialString"
        skipErrors?: boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = cleaning.replaceStringValues_(
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

    @helpers.logCall()
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
        this._tempData = cleaning.modifyValues_(
            cloneDeep(this._data),
            key,
            valueGenerator
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = cleaning.modifyItems_(
            cloneDeep(this._data),
            key,
            itemGenerator
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    excludeOutliers({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = analyzing.excludeOutliers_(
            cloneDeep(this._data),
            key,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    // *** RESTRUCTURING METHODS *** //

    @helpers.logCall()
    removeKey({
        key,
        overwrite = true,
    }: {
        key: string
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = restructuring.removeKey_(cloneDeep(this._data), key)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = restructuring.addKey_(
            cloneDeep(this._data),
            key,
            itemGenerator
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = restructuring.addItems_(
            cloneDeep(this._data),
            dataToBeAdded,
            fillMissingKeys,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = restructuring.mergeItems_(
            cloneDeep(this._data),
            dataToBeMerged,
            commonKey,
            this.verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = restructuring.valuesToKeys_(
            cloneDeep(this._data),
            newKeys,
            newValues,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = restructuring.keysToValues_(
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

    @helpers.logCall()
    selectKeys({
        keys,
        overwrite = true,
    }: {
        keys: string[]
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = selecting.selectKeys_(cloneDeep(this._data), keys)
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = selecting.filterValues_(
            cloneDeep(this._data),
            key,
            valueComparator,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    filterItems({
        itemComparator,
        overwrite = true,
    }: {
        itemComparator: (val: SimpleDataItem) => boolean
        overwrite?: boolean
    }): this {
        this._overwrite = overwrite
        this._tempData = selecting.filterItems_(
            cloneDeep(this._data),
            itemComparator,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    removeDuplicates({
        key,
        overwrite = true,
    }: { key?: string; overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = cleaning.removeDuplicates_(
            cloneDeep(this._data),
            key,
            this.verbose || !this._overwrite
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
    keepDuplicates({
        key,
        overwrite = true,
    }: { key?: string; overwrite?: boolean } = {}): this {
        this._overwrite = overwrite
        this._tempData = cleaning.keepDuplicates_(
            cloneDeep(this._data),
            key,
            this.verbose || !this._overwrite
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    // *** ANALYSIS METHODS *** //

    @helpers.logCall()
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
        this._tempData = analyzing.sortValues_(
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

    @helpers.logCall()
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
        this._tempData = analyzing.addPercentageDistribution_(
            cloneDeep(this._data),
            {
                method,
                keys,
                key,
                newKey,
                groupKeys,
                suffix,
                nbDigits,
                nbTestedValues,
                verbose: this.verbose,
            }
        )
        overwrite && this.#updateSimpleData(this._tempData)
        return this
    }

    @helpers.logCall()
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
        this._tempData = analyzing.addVariation_(
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

    @helpers.logCall()
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
        this._tempData = analyzing.summarize_(
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

    @helpers.logCall()
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
        this._tempData = analyzing.correlation_(
            cloneDeep(this._data),
            key1,
            key2,
            this.verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = analyzing.addQuantiles_(
            cloneDeep(this._data),
            key,
            newKey,
            nbQuantiles
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = analyzing.addBins_(
            cloneDeep(this._data),
            key,
            newKey,
            nbBins
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    @helpers.logCall()
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
        this._tempData = analyzing.addOutliers_(
            cloneDeep(this._data),
            key,
            newKey,
            this.verbose
        )
        overwrite && this.#updateSimpleData(this._tempData)

        return this
    }

    // *** VISUALIZATION METHODS *** //

    @helpers.logCall()
    getChart({
        type,
        x,
        y,
        color,
        trend = false,
        showTrendEquation = false,
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
        showTrendEquation?: boolean
        marginLeft?: number
        marginBottom?: number
    }): string {
        const chart = visualizing.getChart_(
            cloneDeep(this._data),
            type,
            x,
            y,
            color,
            trend,
            showTrendEquation,
            marginLeft,
            marginBottom
        )
        return chart
    }

    @helpers.logCall()
    getCustomChart({ plotOptions }: { plotOptions: object }): string {
        const chart = visualizing.getCustomChart_(plotOptions)
        return chart
    }

    // ** EXPORTING METHODS *** //

    @helpers.logCall()
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
        const item = exporting.getItem_(this._data, conditions, noWarning)
        return item
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getArray({ key }: { key: string }): SimpleDataValue[] {
        const array = exporting.getArray_(this._data, key)

        return array
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getDataAsArrays() {
        const arrays = exporting.getDataAsArrays_(this._data)

        return arrays
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getUniqueValues({ key }: { key: string }): SimpleDataValue[] {
        const uniqueValues = exporting.getUniqueValues_(this._data, key)

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
        return exporting.getMin_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMax({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return exporting.getMax_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMean({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return exporting.getMean_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMedian({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return exporting.getMedian_(this._data, key, nbDigits)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getSum({
        key,
        nbDigits = 2,
    }: {
        key: string
        nbDigits?: number
    }): SimpleDataValue {
        return exporting.getSum_(this._data, key, nbDigits)
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
            methods.showTable_(this._data, nbItemInTable, true)
        }
        return this
    }

    showDuration() {
        if (!this.noLogs) {
            helpers.log(`Total duration ${(this._duration / 1000).toFixed(3)}.`)
        }
        return this
    }
}
