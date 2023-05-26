import {
    addBins,
    addOutliers,
    addProportions,
    addQuantiles,
    addRank,
    addVariation,
    correlation,
    describe,
    excludeOutliers,
    regression,
    sortValues,
    summarize,
} from "../exports/analyzing.js"
import {
    checkValues,
    datesToString,
    excludeMissingValues,
    formatAllKeys,
    modifyItems,
    modifyValues,
    removeDuplicates,
    renameKey,
    replaceValues,
    roundValues,
    valuesToDate,
    valuesToFloat,
    valuesToInteger,
    valuesToString,
} from "../exports/cleaning.js"
import {
    getDataAsArrays,
    getMax,
    getMean,
    getMedian,
    getMin,
    getQuantile,
    getSum,
    getUniqueValues,
    getArray,
    getItem,
} from "../exports/exporting.js"
import {
    arraysToData,
    asyncLogCall,
    cloneData,
    handleMissingKeys,
    log,
    logCall,
    round,
    showTable,
} from "../exports/helpers.js"
import { loadDataFromUrl } from "../exports/importing.js"
import {
    addItems,
    addKey,
    keysToValues,
    mergeItems,
    removeKey,
    valuesToKeys,
} from "../exports/restructuring.js"
import {
    exclude,
    filterItems,
    filterValues,
    keep,
    keepDates,
    keepNumbers,
    keepStrings,
    pickRandomItems,
    selectKeys,
} from "../exports/selecting.js"
import { getChart, getCustomChart } from "../exports/visualizing.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types.js"

/**
 * SimpleData usage example.
 *
 * ```typescript
 * const data = [{ key: value }, ...]
 * const simpleData = new SimpleData({ data: data })
 * ```
 */
export default class SimpleData {
    protected _data: SimpleDataItem[]
    duration: number
    verbose: boolean
    nbTableItemsToLog: number

    /**
     * SimpleData constructor
     * @param __namedParameters.data  Data as a list of objects with the same keys.
     * @param __namedParameters.verbose  Log information in the console on `SimpleData` method calls.
     * @param __namedParameters.nbTableItemsToLog  Number of items to log in table. Only applies when `verbose` is true.
     * @param __namedParameters.fillMissingKeys  Fill missing keys with `undefined`.
     */
    constructor({
        data = [],
        dataAsArrays = false,
        verbose = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        firstItem = 0,
        lastItem = Infinity,
        duration = 0,
    }: {
        data?: SimpleDataItem[] | { [key: string]: SimpleDataValue[] }
        dataAsArrays?: boolean
        verbose?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        firstItem?: number
        lastItem?: number
        duration?: 0
    } = {}) {
        if (
            (Array.isArray(data) && data.length > 0) ||
            Object.keys(data).length > 0
        ) {
            const incomingData = dataAsArrays
                ? arraysToData(
                      cloneData(data) as {
                          [key: string]: SimpleDataValue[]
                      },
                      verbose
                  ).slice(firstItem, lastItem + 1)
                : cloneData(data as SimpleDataItem[]).slice(
                      firstItem,
                      lastItem + 1
                  )

            this._data = handleMissingKeys(
                incomingData,
                fillMissingKeys,
                undefined,
                undefined,
                verbose
            )
        } else {
            verbose && log("\nnew SimpleData()\nStarting an empty SimpleData")

            this._data = []
        }

        this.duration = duration
        this.verbose = verbose
        this.nbTableItemsToLog = nbTableItemsToLog
    }

    // *** IMPORTING METHOD *** //

    @asyncLogCall()
    async loadDataFromUrl({
        url,
        autoType = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        fileNameAsValue = false,
        dataAsArrays = false,
        firstItem = 0,
        lastItem = Infinity,
        nbFirstRowsToExclude = 0,
        nbLastRowsToExclude = Infinity,
    }: {
        url: string | string[]
        autoType?: boolean
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        fileNameAsValue?: boolean
        dataAsArrays?: boolean
        firstItem?: number
        lastItem?: number
        nbFirstRowsToExclude?: number
        nbLastRowsToExclude?: number
    }): Promise<this> {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }
        const data = await loadDataFromUrl(
            url,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            nbFirstRowsToExclude,
            nbLastRowsToExclude,
            fillMissingKeys,
            fileNameAsValue,
            missingKeyValues,
            this.verbose
        )

        this._data = data

        return this
    }

    // CLEANING METHODS //

    @logCall()
    describe(): this {
        this._data = describe(this._data)

        return this
    }

    @logCall()
    checkValues({
        nbItemsToCheck = "all",
        randomize = false,
    }: {
        nbItemsToCheck?: "all" | number
        randomize?: boolean
    } = {}): this {
        this._data = checkValues(this._data, nbItemsToCheck, randomize)

        return this
    }

    @logCall()
    excludeMissingValues({
        key,
        missingValues,
        keepExcludedOnly = false,
    }: {
        key?: string
        missingValues?: SimpleDataValue[]
        keepExcludedOnly?: boolean
    } = {}): this {
        if (missingValues === undefined) {
            missingValues = [null, NaN, undefined, ""]
        }
        this._data = excludeMissingValues(
            this._data,
            key,
            missingValues,
            this.verbose,
            keepExcludedOnly
        )

        return this
    }

    @logCall()
    formatAllKeys(): this {
        this._data = formatAllKeys(this._data, this.verbose)

        return this
    }

    @logCall()
    renameKey({ oldKey, newKey }: { oldKey: string; newKey: string }): this {
        this._data = renameKey(this._data, oldKey, newKey)

        return this
    }

    @logCall()
    valuesToString({ key, newKey }: { key: string; newKey?: string }): this {
        this._data = valuesToString(this._data, key, newKey)

        return this
    }

    @logCall()
    valuesToInteger({
        key,
        thousandSeparator = ",",
        decimalSeparator = ".",
        skipErrors = false,
        newKey,
    }: {
        key: string
        thousandSeparator?: string
        decimalSeparator?: string
        skipErrors?: boolean
        newKey?: string
    }): this {
        this._data = valuesToInteger(
            this._data,
            key,
            thousandSeparator,
            decimalSeparator,
            skipErrors,
            newKey
        )

        return this
    }

    @logCall()
    valuesToFloat({
        key,
        thousandSeparator = ",",
        decimalSeparator = ".",
        skipErrors = false,
        newKey,
    }: {
        key: string
        thousandSeparator?: string
        decimalSeparator?: string
        skipErrors?: boolean
        newKey?: string
    }): this {
        this._data = valuesToFloat(
            this._data,
            key,
            thousandSeparator,
            decimalSeparator,
            skipErrors,
            newKey
        )

        return this
    }

    @logCall()
    valuesToDate({
        key,
        format,
        skipErrors = false,
        newKey,
    }: {
        key: string
        format: string
        skipErrors?: boolean
        newKey?: string
    }): this {
        this._data = valuesToDate(this._data, key, format, skipErrors, newKey)

        return this
    }

    @logCall()
    datesToString({
        key,
        format,
        skipErrors = false,
        newKey,
    }: {
        key: string
        format: string
        skipErrors?: boolean
        newKey?: string
    }): this {
        this._data = datesToString(this._data, key, format, skipErrors, newKey)

        return this
    }

    @logCall()
    roundValues({
        key,
        nbDigits = 1,

        skipErrors = false,
        newKey,
    }: {
        key: string
        nbDigits?: number
        skipErrors?: boolean

        newKey?: string
    }): this {
        this._data = roundValues(this._data, key, nbDigits, skipErrors, newKey)

        return this
    }

    @logCall()
    replaceValues({
        key,
        oldValue,
        newValue,
        method = undefined,
        skipErrors = false,
        newKey,
    }: {
        key: string
        oldValue: SimpleDataValue
        newValue: SimpleDataValue
        method?: undefined | "entireString" | "partialString"
        skipErrors?: boolean
        newKey?: string
    }): this {
        this._data = replaceValues(
            this._data,
            key,
            oldValue,
            newValue,
            method,
            skipErrors,
            newKey
        )

        return this
    }

    @logCall()
    modifyValues({
        key,
        valueGenerator,
        newKey,
    }: {
        key: string
        valueGenerator: (val: SimpleDataValue) => SimpleDataValue
        newKey?: string
    }): this {
        this._data = modifyValues(this._data, key, valueGenerator, newKey)

        return this
    }

    @logCall()
    modifyItems({
        key,
        itemGenerator,
        newKey,
    }: {
        key: string
        itemGenerator: (item: SimpleDataItem) => SimpleDataValue
        newKey?: string
    }): this {
        this._data = modifyItems(this._data, key, itemGenerator, newKey)

        return this
    }

    @logCall()
    excludeOutliers({
        key,
        nbTestedValues = 10000,
    }: {
        key: string
        nbTestedValues?: number
    }): this {
        this._data = excludeOutliers(
            this._data,
            key,
            nbTestedValues,
            this.verbose
        )

        return this
    }

    // *** RESTRUCTURING METHODS *** //

    @logCall()
    removeKey({ key }: { key: string }): this {
        this._data = removeKey(this._data, key)

        return this
    }

    @logCall()
    addKey({
        key,
        itemGenerator,
    }: {
        key: string
        itemGenerator: (item: SimpleDataItem) => SimpleDataValue
    }): this {
        this._data = addKey(this._data, key, itemGenerator)

        return this
    }

    @logCall()
    addRank({
        newKey,
        key,
        sortInPlace,
        order,
        locale,
        handleTies,
    }: {
        newKey: string
        key?: string | string[]
        sortInPlace?: true | false
        order?: "ascending" | "descending"
        locale?: string | (string | undefined | null | boolean)[]
        handleTies?: "tieNoGaps" | "tie" | "noTie"
    }): this {
        this._data = addRank(
            this._data,
            newKey,
            key,
            sortInPlace,
            order,
            handleTies,
            locale
        )

        return this
    }

    @logCall()
    addItems({
        dataToBeAdded,
        fillMissingKeys = false,
        defaultValue = undefined,
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData
        fillMissingKeys?: boolean
        defaultValue?: SimpleDataValue
    }): this {
        this._data = addItems(
            this._data,
            dataToBeAdded,
            fillMissingKeys,
            defaultValue,
            this.verbose
        )

        return this
    }

    @logCall()
    mergeItems({
        dataToBeMerged,
        commonKey,
        nbTestedValues = 10000,
    }: {
        dataToBeMerged: SimpleDataItem[] | SimpleData
        commonKey: string
        nbTestedValues?: number
    }): this {
        this._data = mergeItems(
            this._data,
            dataToBeMerged,
            commonKey,
            this.verbose,
            nbTestedValues
        )

        return this
    }

    @logCall()
    valuesToKeys({
        newKeys,
        newValues,
    }: {
        newKeys: string
        newValues: string
    }): this {
        this._data = valuesToKeys(this._data, newKeys, newValues, this.verbose)

        return this
    }

    @logCall()
    keysToValues({
        keys,
        newKeyForKeys,
        newKeyForValues,
    }: {
        keys: string[]
        newKeyForKeys: string
        newKeyForValues: string
    }): this {
        this._data = keysToValues(
            this._data,
            keys,
            newKeyForKeys,
            newKeyForValues,
            this.verbose
        )

        return this
    }

    //*** SELECTION METHODS ***/

    @logCall()
    selectKeys({ keys }: { keys: string[] }): this {
        this._data = selectKeys(this._data, keys)

        return this
    }

    @logCall()
    filterValues({
        key,
        valueComparator,
    }: {
        key: string
        valueComparator: (val: SimpleDataValue) => SimpleDataValue
    }): this {
        this._data = filterValues(
            this._data,
            key,
            valueComparator,
            this.verbose
        )

        return this
    }

    @logCall()
    filterItems({
        itemComparator,
    }: {
        itemComparator: (val: SimpleDataItem) => boolean
    }): this {
        this._data = filterItems(this._data, itemComparator, this.verbose)

        return this
    }

    @logCall()
    pickRandomItems({
        nbItems,
        seed,
    }: {
        nbItems: number
        seed?: number
    }): this {
        this._data = pickRandomItems(this._data, nbItems, seed, this.verbose)

        return this
    }

    @logCall()
    removeDuplicates({
        key,
        keepDuplicatesOnly = false,
        nbToKeep = 1,
    }: {
        key?: string
        keepDuplicatesOnly?: boolean
        nbToKeep?: number
    } = {}): this {
        this._data = removeDuplicates(
            this._data,
            key,
            keepDuplicatesOnly,
            nbToKeep,
            this.verbose
        )

        return this
    }

    @logCall()
    keep({
        key,
        value,
    }: {
        key: string
        value: SimpleDataValue | SimpleDataValue[]
    }) {
        this._data = keep(this._data, key, value, this.verbose)

        return this
    }

    @logCall()
    exclude({
        key,
        value,
    }: {
        key: string
        value: SimpleDataValue | SimpleDataValue[]
    }) {
        this._data = exclude(this._data, key, value, this.verbose)

        return this
    }

    @logCall()
    keepNumbers({
        key,
        keepNonNumbersOnly = false,
    }: {
        key: string
        keepNonNumbersOnly?: boolean
    }): this {
        this._data = keepNumbers(
            this._data,
            key,
            keepNonNumbersOnly,
            this.verbose
        )

        return this
    }

    @logCall()
    keepDates({
        key,
        keepNonDatesOnly = false,
    }: {
        key: string
        keepNonDatesOnly?: boolean
    }): this {
        this._data = keepDates(this._data, key, keepNonDatesOnly, this.verbose)

        return this
    }

    @logCall()
    keepStrings({
        key,
        keepNonStringOnly = false,
    }: {
        key: string
        keepNonStringOnly?: boolean
    }): this {
        this._data = keepStrings(
            this._data,
            key,
            keepNonStringOnly,
            this.verbose
        )

        return this
    }

    // *** ANALYSIS METHODS *** //

    @logCall()
    sortValues({
        key,
        order = "ascending",
        locale,
    }: {
        key: string | string[]
        order: "ascending" | "descending"
        locale?: string | (string | undefined | null | boolean)[]
    }): this {
        this._data = sortValues(this._data, key, order, locale)

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
    }: {
        method: "item" | "data"
        key?: string
        keys?: string[]
        newKey?: string
        keyCategory?: string | string[]
        suffix?: string
        nbDigits?: number
        nbTestedValues?: number
    }): this {
        this._data = addProportions(this._data, {
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

        return this
    }

    @logCall()
    addVariation({
        key,
        newKey,
        valueGenerator,
        order = undefined,
        firstValue = undefined,
        nbTestedValues = 10000,
    }: {
        key: string
        newKey: string
        valueGenerator: (
            a: SimpleDataValue,
            b: SimpleDataValue
        ) => SimpleDataValue
        order?: "ascending" | "descending" | undefined
        firstValue?: SimpleDataValue
        nbTestedValues?: number
    }) {
        this._data = addVariation(
            this._data,
            key,
            newKey,
            valueGenerator,
            order,
            firstValue,
            nbTestedValues,
            this.verbose
        )

        return this
    }

    @logCall()
    summarize({
        keyValue,
        keyCategory,
        summary,
        weight,
        nbTestedValues = 10000,
        nbDigits,
    }: {
        keyValue?: string | string[]
        keyCategory?: string | string[]
        summary?: string | string[]
        weight?: string
        nbTestedValues?: number
        nbDigits?: number
    } = {}): this {
        this._data = summarize(
            this._data,
            keyValue,
            keyCategory,
            summary,
            weight,
            nbTestedValues,
            this.verbose,
            nbDigits
        )

        return this
    }

    @logCall()
    correlation({
        keyX,
        keyY,
        keyCategory,
        nbDigits = 4,

        nbTestedValues = 10000,
    }: {
        keyX?: string
        keyY?: string | string[]
        keyCategory?: string

        nbDigits?: number
        nbTestedValues?: number
    } = {}): this {
        this._data = correlation(
            this._data,
            keyX,
            keyY,
            keyCategory,
            nbDigits,
            this.verbose,
            nbTestedValues
        )

        return this
    }

    @logCall()
    regression({
        keyX,
        keyY,
        keyCategory,
        type = "linear",
        order,
        nbDigits = 4,

        nbTestedValues = 10000,
    }: {
        keyX?: string
        keyY?: string | string[]
        keyCategory?: string
        type?:
            | "linear"
            | "quadratic"
            | "polynomial"
            | "exponential"
            | "logarithmic"
            | "power"
        order?: number

        nbDigits?: number
        nbTestedValues?: number
    } = {}): this {
        this._data = regression(
            this._data,
            keyX,
            keyY,
            type,
            keyCategory,
            order,
            nbDigits,
            this.verbose,
            nbTestedValues
        )

        return this
    }

    @logCall()
    addQuantiles({
        key,
        newKey,
        nbQuantiles,
        nbTestedValues = 10000,
    }: {
        key: string
        newKey: string
        nbQuantiles: number
        nbTestedValues?: number
    }): this {
        this._data = addQuantiles(
            this._data,
            key,
            newKey,
            nbQuantiles,
            nbTestedValues,
            this.verbose
        )

        return this
    }

    @logCall()
    addBins({
        key,
        newKey,
        nbBins,
        nbTestedValues = 10000,
    }: {
        key: string
        newKey: string
        nbBins: number
        nbTestedValues?: number
    }): this {
        this._data = addBins(
            this._data,
            key,
            newKey,
            nbBins,
            nbTestedValues,
            this.verbose
        )

        return this
    }

    @logCall()
    addOutliers({
        key,
        newKey,
        nbTestedValues = 10000,
    }: {
        key: string
        newKey: string
        nbTestedValues?: number
    }): this {
        this._data = addOutliers(
            this._data,
            key,
            newKey,
            nbTestedValues,
            this.verbose
        )

        return this
    }

    // *** VISUALIZATION METHODS *** //

    @logCall()
    getChart({
        type,
        x,
        y,
        color,
        colorScale,
        trend = false,
        showTrendEquation = false,
        width,
        height,
        marginLeft,
        marginBottom,
        title,
        smallMultipleKey,
        smallMultipleWidth,
        smallMultipleHeight,
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
        colorScale?: "linear" | "diverging" | "categorical" | "ordinal"
        trend?: boolean
        showTrendEquation?: boolean
        width?: number
        height?: number
        marginLeft?: number
        marginBottom?: number
        title?: string
        smallMultipleKey?: string
        smallMultipleWidth?: number
        smallMultipleHeight?: number
    }): string {
        return getChart(
            this._data,
            type,
            x,
            y,
            color,
            colorScale,
            trend,
            showTrendEquation,
            marginLeft,
            marginBottom,
            width,
            height,
            title,
            smallMultipleKey,
            smallMultipleWidth,
            smallMultipleHeight
        )
    }

    @logCall()
    getCustomChart({ plotOptions }: { plotOptions: object }): string {
        return getCustomChart(plotOptions)
    }

    // ** EXPORTING METHODS *** //

    @logCall()
    clone(): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new this.constructor({
            data: this._data,
            verbose: this.verbose,
            nbTableItemsToLog: this.nbTableItemsToLog,
        })
    }

    // No @logCall otherwise it's triggered everywhere, including in methods
    getData(): SimpleDataItem[] {
        return cloneData(this._data)
    }

    // No @logCall otherwise it's triggered everywhere, including in methods
    getFirst(): SimpleDataItem {
        return cloneData(this._data[0])
    }

    // No @logCall otherwise it's triggered everywhere, including in methods
    getLast(): SimpleDataItem {
        return cloneData(this._data[this._data.length - 1])
    }

    //No @logCall otherwise it's triggered everywhere, including in methods
    getLength(): number {
        return this._data.length
    }

    //No @logCall otherwise it's triggered everywhere, including in methods
    getKeys(): string[] {
        return this._data.length > 0 ? Object.keys(this._data[0]) : []
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getItem({
        conditions,
        noWarning = false,
    }: {
        conditions: SimpleDataItem
        noWarning?: boolean
    }): SimpleDataItem | undefined {
        return getItem(cloneData(this._data), conditions, noWarning)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getArray({ key }: { key: string | string[] }): SimpleDataValue[] {
        return getArray(cloneData(this._data), key)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getDataAsArrays() {
        return getDataAsArrays(cloneData(this._data))
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getUniqueValues({ key }: { key: string }): SimpleDataValue[] {
        return getUniqueValues(this._data, key)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMin({
        key,
        nbDigits = undefined,
        nbTestedValues = 10000,
        type = "number",
    }: {
        key: string
        nbDigits?: number
        nbTestedValues?: number
        type?: "number" | "Date"
    }): SimpleDataValue {
        return getMin(
            this._data,
            key,
            nbDigits,
            nbTestedValues,
            type,
            this.verbose
        )
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMax({
        key,
        nbDigits = undefined,
        nbTestedValues = 10000,
        type = "number",
    }: {
        key: string
        nbDigits?: number | undefined
        nbTestedValues?: number
        type?: "number" | "Date"
    }): SimpleDataValue {
        return getMax(
            this._data,
            key,
            nbDigits,
            nbTestedValues,
            type,
            this.verbose
        )
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMean({
        key,
        nbDigits = 2,
        nbTestedValues = 10000,
        type = "number",
    }: {
        key: string
        nbDigits?: number
        nbTestedValues?: number
        type?: "number" | "Date"
    }): SimpleDataValue {
        return getMean(
            this._data,
            key,
            nbDigits,
            nbTestedValues,
            type,
            this.verbose
        )
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getMedian({
        key,
        nbDigits = 2,
        nbTestedValues = 10000,
        type = "number",
    }: {
        key: string
        nbDigits?: number
        nbTestedValues?: number
        type?: "number" | "Date"
    }): SimpleDataValue {
        return getMedian(
            this._data,
            key,
            nbDigits,
            nbTestedValues,
            type,
            this.verbose
        )
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getSum({
        key,
        nbDigits = 2,
        nbTestedValues = 10000,
    }: {
        key: string
        nbDigits?: number
        nbTestedValues?: number
    }): SimpleDataValue {
        return getSum(this._data, key, nbDigits, nbTestedValues, this.verbose)
    }

    // No @logCall for methods starting with get. It's not returning a simpleData class
    getQuantile({
        key,
        quantile,
        nbDigits = 2,
        nbTestedValues = 10000,
    }: {
        key: string
        quantile: number
        nbDigits?: number
        nbTestedValues?: number
    }): SimpleDataValue {
        return getQuantile(
            this._data,
            key,
            quantile,
            nbDigits,
            nbTestedValues,
            this.verbose
        )
    }

    getDuration() {
        return this.duration
    }

    // *** LOGGING METHODS AND OTHERS *** //

    // No log call, otherwise the table is shown twice.
    showTable({
        nbItemInTable = 5,
    }: { nbItemInTable?: "all" | number } = {}): this {
        showTable(this._data, nbItemInTable, true)

        return this
    }

    showDuration() {
        log(`Total duration ${round(this.duration / 1000, 3)}.`)

        return this
    }
}
