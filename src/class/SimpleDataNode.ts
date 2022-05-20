import fs from "fs"
import { JSDOM } from "jsdom"
import SimpleData from "./SimpleData.js"
import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import loadDataFromLocalFile_ from "../methods/loadDataFromLocalFile.js"
import saveData_ from "../methods/saveData.js"
import { logCall } from "../helpers/logCall.js"
import checkKeys from "../helpers/checkKeys.js"
import log from "../helpers/log.js"


export default class SimpleDataNode extends SimpleData {

    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    // ** SPECIFIC NODEJS METHODS ** //

    @logCall()
    loadDataFromLocalFile({
        path,
        missingKeyValues = { "null": null, "NaN": NaN, "undefined": undefined },
        encoding = "utf8"
    }: {
        path: string,
        encoding?: BufferEncoding,
        missingKeyValues?: SimpleDataItem
    }): SimpleDataNode {
        if (this._data.length > 0) {
            throw new Error("This SimpleData already has data. Create another one.")
        }

        const data = loadDataFromLocalFile_({
            path: path,
            verbose: this.verbose,
            missingKeyValues: missingKeyValues,
            encoding: encoding
        })

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        checkKeys(data)

        this.#updateSimpleData(data)

        return this
    }

    @logCall()
    saveData({ path, encoding = "utf8" }: { path: string, encoding?: BufferEncoding }): SimpleDataNode {

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

        if (global.document === undefined) {
            const jsdom = new JSDOM("")
            global.document = jsdom.window.document
        }

        const chart = super.getChart({ x, y, type, color })

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart save to ${path}`, "blue")

        return chart
    }

    @logCall()
    saveCustomChart({ path, plotOptions }: { path: string, plotOptions: object }): string {

        if (global.document === undefined) {
            const jsdom = new JSDOM("")
            global.document = jsdom.window.document
        }
        const chart = super.getCustomChart({ plotOptions })

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart save to ${path}`, "blue")

        return chart
    }

    // INHERITED METHODS //

    // *** IMPORTING METHOD *** //

    async loadDataFromUrl({
        url,
        missingKeyValues = { "null": null, "NaN": NaN, "undefined": undefined },
        encoding = "utf8"
    }: {
        url: string,
        encoding?: BufferEncoding,
        missingKeyValues?: SimpleDataItem
    }): Promise<SimpleDataNode> {
        return super.loadDataFromUrl({ url, missingKeyValues, encoding }) as Promise<SimpleDataNode>
    }

    // CLEANING METHODS AND RESTRUCTURING METHODS //

    describe({ overwrite = false }: { overwrite?: boolean } = {}): SimpleDataNode {
        return super.describe({ overwrite }) as SimpleDataNode
    }

    checkValues({ overwrite = false }: { overwrite?: boolean } = {}): SimpleDataNode {
        return super.checkValues({ overwrite }) as SimpleDataNode
    }

    excludeMissingValues({
        key,
        missingValues,
        overwrite = true
    }: {
        key?: string,
        missingValues?: SimpleDataValue[],
        overwrite?: boolean
    } = {}): SimpleDataNode {
        return super.excludeMissingValues({ key, missingValues, overwrite }) as SimpleDataNode
    }

    formatAllKeys({ overwrite = true }: { overwrite?: boolean } = {}): SimpleDataNode {
        return super.formatAllKeys({ overwrite }) as SimpleDataNode
    }

    renameKey({ oldKey, newKey, overwrite = true }: { oldKey: string, newKey: string, overwrite?: boolean }): SimpleDataNode {
        return super.renameKey({ oldKey, newKey, overwrite }) as SimpleDataNode
    }

    removeKey({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleDataNode {
        return super.removeKey({ key, overwrite }) as SimpleDataNode
    }

    addKey({ key, valueGenerator, overwrite = true }: { key: string, valueGenerator: (item: SimpleDataItem) => SimpleDataValue, overwrite?: boolean }): SimpleDataNode {
        return super.addKey({ key, valueGenerator, overwrite }) as SimpleDataNode
    }

    valuesToString({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleDataNode {
        return super.valuesToString({ key, overwrite }) as SimpleDataNode
    }

    valuesToInteger({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleDataNode {
        return super.valuesToInteger({ key, overwrite }) as SimpleDataNode
    }

    valuesToFloat({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleDataNode {
        return super.valuesToFloat({ key, overwrite }) as SimpleDataNode
    }

    valuesToDate({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleDataNode {
        return super.valuesToDate({ key, format, overwrite }) as SimpleDataNode
    }

    datesToString({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleDataNode {
        return super.datesToString({ key, format, overwrite }) as SimpleDataNode
    }

    roundValues({ key, nbDigits = 1, overwrite = true }: { key: string, nbDigits?: number, overwrite?: boolean }): SimpleDataNode {
        return super.roundValues({ key, nbDigits, overwrite }) as SimpleDataNode
    }

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
    }): SimpleDataNode {
        return super.replaceValues({ key, oldValue, newValue, method, overwrite }) as SimpleDataNode
    }

    modifyValues({ key, valueGenerator, overwrite = true }: { key: string, valueGenerator: (val: SimpleDataValue) => SimpleDataValue, overwrite?: boolean }): SimpleDataNode {
        return super.modifyValues({ key, valueGenerator, overwrite }) as SimpleDataNode
    }

    modifyItems({ key, itemGenerator, overwrite = true }: { key: string, itemGenerator: (item: SimpleDataItem) => SimpleDataValue, overwrite?: boolean }): SimpleDataNode {
        return super.modifyItems({ key, itemGenerator, overwrite }) as SimpleDataNode
    }

    excludeOutliers({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleDataNode {
        return super.excludeOutliers({ key, overwrite }) as SimpleDataNode
    }

    addItems({
        dataToBeAdded,
        overwrite = true
    }: {
        dataToBeAdded: SimpleDataItem[] | SimpleData | SimpleDataNode,
        overwrite?: boolean
    }): SimpleDataNode {
        return super.addItems({ dataToBeAdded, overwrite }) as SimpleDataNode
    }

    mergeItems({
        dataToBeMerged,
        commonKey,
        nbValuesTestedForTypeOf = 10000,
        overwrite = true
    }: {
        dataToBeMerged: SimpleDataItem[] | SimpleData | SimpleDataNode,
        commonKey: string,
        nbValuesTestedForTypeOf?: number,
        overwrite?: boolean
    }): SimpleDataNode {
        return super.mergeItems({ dataToBeMerged, commonKey, nbValuesTestedForTypeOf, overwrite }) as SimpleDataNode
    }

    //*** SELECTION METHODS ***/

    selectKeys({ keys, overwrite = true }: { keys: string[], overwrite?: boolean }): SimpleDataNode {
        return super.selectKeys({ keys, overwrite }) as SimpleDataNode
    }

    filterValues({ key, valueComparator, overwrite = true }: { key: string, valueComparator: (val: SimpleDataValue) => SimpleDataValue, overwrite?: boolean }): SimpleDataNode {
        return super.filterValues({ key, valueComparator, overwrite }) as SimpleDataNode
    }

    filterItems({ itemComparator, overwrite = true }: { itemComparator: (val: SimpleDataItem) => boolean, overwrite?: boolean }): SimpleDataNode {
        return super.filterItems({ itemComparator, overwrite }) as SimpleDataNode
    }

    // *** ANALYSIS METHODS *** //

    sortValues({
        key,
        order,
        overwrite = true
    }: {
        key: string,
        order: "ascending" | "descending",
        overwrite?: boolean
    }): SimpleDataNode {
        return super.sortValues({ key, order, overwrite }) as SimpleDataNode
    }

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
    } = {}): SimpleDataNode {
        return super.summarize({ keyValue, keyCategory, summary, weight, overwrite, nbDigits, nbValuesTestedForTypeOf }) as SimpleDataNode
    }

    correlation({
        key1,
        key2,
        overwrite = false,
        nbValuesTestedForTypeOf = 10000
    }: {
        key1?: string,
        key2?: string,
        overwrite?: boolean,
        nbValuesTestedForTypeOf?: number
    } = {}): SimpleDataNode {
        return super.correlation({ key1, key2, overwrite, nbValuesTestedForTypeOf }) as SimpleDataNode
    }

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
    }): SimpleDataNode {
        return super.addQuantiles({ key, newKey, nbQuantiles, overwrite }) as SimpleDataNode
    }

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
    }): SimpleDataNode {
        return super.addBins({ key, newKey, nbBins, overwrite }) as SimpleDataNode
    }

    addOutliers({
        key,
        newKey,
        overwrite = true
    }: {
        key: string,
        newKey: string,
        overwrite?: boolean
    }): SimpleDataNode {
        return super.addOutliers({ key, newKey, overwrite }) as SimpleDataNode
    }

    // *** VISUALIZATION METHODS *** //

    // No need to update types.

    // ** EXPORTING METHODS *** //

    clone(): SimpleDataNode {
        return super.clone() as SimpleDataNode
    }

    // No need to update the other methods

    // *** LOGGING METHODS AND OTHERS *** //

    showTable({ nbItemInTable = 5 }: { nbItemInTable?: "all" | number } = {}): SimpleDataNode {
        // TODO: test this!
        return super.showTable({ nbItemInTable }) as SimpleDataNode
    }


}