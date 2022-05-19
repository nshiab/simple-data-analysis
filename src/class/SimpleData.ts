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
import logCall from "../helpers/logCall.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import loadDataFromLocalFile from "../functions/loadDataFromLocalFile.js"
import loadDataFromUrl from "../functions/loadDataFromUrl.js"

export default class SimpleData {

    _data: SimpleDataItem[]
    _keys: string[]
    // Logging 
    verbose: boolean
    logParameters: boolean
    nbTableItemsToLog: number

    constructor(
    ) {

        this._data = []
        this._keys = []

        this.verbose = false
        this.logParameters = false
        this.nbTableItemsToLog = 5

    }

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    @logCall()
    async init({
        url,
        path,
        data,
        verbose = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        missingKeyValues = { "null": null, "NaN": NaN, "undefined": undefined },
        encoding = "utf8"
    }: {
        url?: string,
        path?: string,
        data?: SimpleDataItem[],
        encoding?: BufferEncoding,
        missingKeyValues?: SimpleDataItem,
        verbose?: boolean,
        logParameters?: boolean,
        nbTableItemsToLog?: number,

    } = {}): Promise<SimpleData> {

        const allDataArguments = [url, path, data]
        let nbDataArguments = 0
        for (const dataArg of allDataArguments) {
            if (dataArg !== undefined) {
                nbDataArguments += 1
            }
        }
        if (nbDataArguments === 0) {
            throw new Error("You must provide either data, url or path.")
        }
        if (nbDataArguments > 1) {
            throw new Error("SimpleData can be created with either data, url or path, but not a combination of them. Provide only one of them.")
        }

        if (path) {
            data = loadDataFromLocalFile({
                path: path,
                verbose: verbose,
                missingKeyValues: missingKeyValues,
                encoding: encoding
            })
        }
        if (url) {
            data = await loadDataFromUrl({
                url: url,
                verbose: verbose,
                missingKeyValues: missingKeyValues,
                encoding: encoding
            })
            data = []
        }

        if (!data) {
            throw new Error("data is undefined")
        }
        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        console.log(data)

        checkKeys(data)

        this._data = data
        this._keys = Object.keys(data[0])

        this.verbose = verbose
        this.logParameters = logParameters
        this.nbTableItemsToLog = nbTableItemsToLog

        return this

    }

    @logCall()
    getData(): SimpleDataItem[] {
        return this._data
    }

    @logCall()
    getKeys(): string[] {
        return this._keys
    }

    @logCall()
    clone(): SimpleData {
        const newSimpleData = cloneDeep(this)

        return newSimpleData
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

    @logCall()
    checkValues({ overwrite = false }: { overwrite?: boolean } = {}): SimpleData {
        const data = checkValues_(this._data)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    describe({ overwrite = false }: { overwrite?: boolean } = {}): SimpleData {
        const data = describe_(this._data)
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
        nbValuesTestedForTypeOf = 1000
    }: {
        keyValue?: string | string[],
        keyCategory?: string | string[],
        summary?: string | string[],
        weight?: string,
        overwrite?: boolean,
        nbDigits?: number,
        nbValuesTestedForTypeOf?: number
    } = {}): SimpleData {
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
        nbDigits = 3,
        nbValuesTestedForTypeOf = 10000
    }: {
        key1?: string,
        key2?: string,
        overwrite?: boolean,
        nbDigits?: number,
        nbValuesTestedForTypeOf?: number
    } = {}): SimpleData {
        const data = correlation_(
            this._data,
            this.verbose,
            nbDigits,
            nbValuesTestedForTypeOf,
            key1,
            key2,
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeMissingValues({
        key,
        missingValues,
        overwrite = true
    }: {
        key?: string,
        missingValues?: SimpleDataValue[],
        overwrite?: boolean
    } = {}): SimpleData {
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
    renameKey({ oldKey, newKey, overwrite = true }: { oldKey: string, newKey: string, overwrite?: boolean }): SimpleData {
        const data = renameKey_(this._data, oldKey, newKey)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    removeKey({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = removeKey_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addKey({ key, valueGenerator, overwrite = true }: { key: string, valueGenerator: (item: SimpleDataItem) => SimpleDataValue, overwrite?: boolean }): SimpleData {
        const data = addKey_(this._data, key, valueGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    selectKeys({ keys, overwrite = true }: { keys: string[], overwrite?: boolean }): SimpleData {
        const data = selectKeys_(this._data, keys)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyValues({ key, valueGenerator, overwrite = true }: { key: string, valueGenerator: (val: SimpleDataValue) => SimpleDataValue, overwrite?: boolean }): SimpleData {
        const data = modifyValues_(this._data, key, valueGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyItems({ key, itemGenerator, overwrite = true }: { key: string, itemGenerator: (item: SimpleDataItem) => SimpleDataValue, overwrite?: boolean }): SimpleData {
        const data = modifyItems_(this._data, key, itemGenerator)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    formatAllKeys({ overwrite = true }: { overwrite?: boolean } = {}): SimpleData {
        const data = formatAllKeys_(this._data, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToString({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToString_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToInteger({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToInteger_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToFloat({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToFloat_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToDate({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleData {
        const data = valuesToDate_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    datesToString({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleData {
        const data = datesToString_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterValues({ key, valueComparator, overwrite = true }: { key: string, valueComparator: (val: SimpleDataValue) => SimpleDataValue, overwrite?: boolean }): SimpleData {
        const data = filterValues_(this._data, key, valueComparator, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterItems({ itemComparator, overwrite = true }: { itemComparator: (val: SimpleDataItem) => boolean, overwrite?: boolean }): SimpleData {
        const data = filterItems_(this._data, itemComparator, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    roundValues({ key, nbDigits = 1, overwrite = true }: { key: string, nbDigits?: number, overwrite?: boolean }): SimpleData {
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
        overwrite = true
    }: {
        key: string,
        oldValue: string,
        newValue: string,
        method: "entireString" | "partialString",
        overwrite?: boolean
    }): SimpleData {
        const data = replaceValues_(this._data, key, oldValue, newValue, method)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    sortValues({
        key,
        order,
        overwrite = true
    }: {
        key: string,
        order: "ascending" | "descending",
        overwrite?: boolean
    }): SimpleData {
        const data = sortValues_(this._data, key, order)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addQuantiles({
        key,
        newKey,
        nbQuantiles,
        overwrite = true
    }: {
        key: string,
        newKey: string,
        nbQuantiles: number,
        overwrite?: boolean
    }): SimpleData {
        const data = addQuantiles_(this._data, key, newKey, nbQuantiles, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addBins({
        key,
        newKey,
        nbBins,
        overwrite = true
    }: {
        key: string,
        newKey: string,
        nbBins: number,
        overwrite?: boolean
    }): SimpleData {
        const data = addBins_(this._data, key, newKey, nbBins, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addOutliers({
        key,
        newKey,
        overwrite = true
    }: {
        key: string,
        newKey: string,
        overwrite?: boolean
    }): SimpleData {
        const data = addOutliers_(this._data, key, newKey, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeOutliers({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = excludeOutliers_(this._data, key, this.verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addItems({
        dataToBeAdded,
        overwrite = true
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData,
        nbDigits?: number,
        overwrite?: boolean
    }): SimpleData {
        const data = addItems_(
            this._data,
            dataToBeAdded,
            this.verbose
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    mergeItems({
        dataToBeMerged,
        commonKey,
        nbValuesTestedForTypeOf = 10000,
        overwrite = true
    }: {
        dataToBeMerged: SimpleDataItem[] | SimpleData,
        commonKey: string,
        nbValuesTestedForTypeOf?:
        number, overwrite?: boolean
    }): SimpleData {
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

    @logCall()
    saveData({ path, encoding = "utf8" }: { path: string, encoding?: BufferEncoding }): SimpleData {
        saveData_(
            this._data,
            path,
            this.verbose,
            encoding
        )

        return this
    }

    @logCall()
    saveChart({ path, type, x, y, color }: { path: string, type: "dot" | "line" | "bar" | "box", x: string, y: string, color?: string }): string {
        const chart = saveChart_(this._data, path, type, x, y, color, this.verbose)

        return chart
    }

    @logCall()
    saveCustomChart({ path, plotOptions }: { path: string, plotOptions: object }): string {
        const chart = saveCustomChart_(this._data, path, plotOptions, this.verbose)

        return chart
    }

    @logCall()
    showTable({ nbItemInTable = 5 }: { nbItemInTable?: "all" | number } = {}): SimpleData {
        // TODO: test this!
        showTable_(this._data, nbItemInTable)

        return this
    }

}