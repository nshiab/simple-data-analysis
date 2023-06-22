import { SimpleDataItem } from "../types/SimpleData.types"
import { asyncLogCall, logCall } from "../exports/helpers.js"
import {
    loadDataFromUrl,
    loadDataFromLocalFile,
    loadDataFromLocalDirectory,
    loadDataWithStream,
} from "../exports/importingNode.js"
import { saveData, saveDataWithStream } from "../exports/exportingNode.js"
import { saveChart, saveCustomChart } from "../exports/visualizingNode.js"
import SimpleDataGeo from "./SimpleDataGeo.js"

export default class SimpleDataNode extends SimpleDataGeo {
    // ** OVERWRITING METHODS ** //

    @asyncLogCall()
    async loadDataFromUrl({
        url,
        autoType = false,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        fileNameAsValue = false,
        firstItem = 0,
        lastItem = Infinity,
        nbFirstRowsToExclude = 0,
        nbLastRowsToExclude = Infinity,
        format = undefined,
        headers = undefined,
    }: {
        url: string | string[]
        autoType?: boolean
        dataAsArrays?: boolean
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        fileNameAsValue?: boolean
        firstItem?: number
        lastItem?: number
        nbFirstRowsToExclude?: number
        nbLastRowsToExclude?: number
        format?: "csv" | "tsv" | "json"
        headers?: string[]
    }): Promise<this> {
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
            format,
            headers,
            this.verbose
        )
        this._data = data

        return this
    }

    // ** SPECIFIC NODEJS METHODS ** //

    @logCall()
    loadDataFromLocalFile({
        path,
        autoType = false,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        encoding = "utf8",
        fillMissingKeys = false,
        fileNameAsValue = false,
        firstItem = 0,
        lastItem = Infinity,
        nbFirstRowsToExclude = 0,
        nbLastRowsToExclude = Infinity,
        format = undefined,
        headers = undefined,
    }: {
        path: string | string[]
        autoType?: boolean
        dataAsArrays?: boolean
        encoding?: BufferEncoding
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        fileNameAsValue?: boolean
        firstItem?: number
        lastItem?: number
        nbFirstRowsToExclude?: number
        nbLastRowsToExclude?: number
        format?: "csv" | "tsv" | "json"
        headers?: string[]
    }): this {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }

        this._data = loadDataFromLocalFile(
            path,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            nbFirstRowsToExclude,
            nbLastRowsToExclude,
            fillMissingKeys,
            fileNameAsValue,
            missingKeyValues,
            format,
            encoding,
            headers,
            this.verbose
        )

        return this
    }

    @asyncLogCall()
    async loadDataWithStream({
        path,
        specificKeys,
        fileNameAsValue = false,
        encoding = "utf8",
        showItemIndexEveryX,
        format = undefined,
        headers = undefined,
    }: {
        path: string | string[]
        specificKeys?: string[] | false
        fileNameAsValue?: boolean
        encoding?: BufferEncoding
        showItemIndexEveryX?: number | false
        format?: "csv" | "tsv"
        headers?: string[]
    }): Promise<this> {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }

        this._data = await loadDataWithStream(
            path,
            specificKeys,
            fileNameAsValue,
            encoding,
            showItemIndexEveryX,
            format,
            headers,
            this.verbose
        )

        return this
    }

    @logCall()
    loadDataFromLocalDirectory({
        path,
        autoType = false,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        encoding = "utf8",
        fillMissingKeys = false,
        fileNameAsValue = false,
        firstItem = 0,
        lastItem = Infinity,
        nbFirstRowsToExclude = 0,
        nbLastRowsToExclude = Infinity,
        format = undefined,
        headers = undefined,
    }: {
        path: string
        autoType?: boolean
        dataAsArrays?: boolean
        encoding?: BufferEncoding
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        fileNameAsValue?: boolean
        firstItem?: number
        lastItem?: number
        nbFirstRowsToExclude?: number
        nbLastRowsToExclude?: number
        format?: "csv" | "tsv" | "json"
        headers?: string[]
    }): this {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }

        this._data = loadDataFromLocalDirectory(
            path,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            nbFirstRowsToExclude,
            nbLastRowsToExclude,
            fillMissingKeys,
            fileNameAsValue,
            missingKeyValues,
            encoding,
            format,
            headers,
            this.verbose
        )

        return this
    }

    @asyncLogCall()
    async saveDataWithStream({
        path,
        encoding = "utf8",
        showItemIndexEveryX,
    }: {
        path: string
        encoding?: BufferEncoding
        showItemIndexEveryX?: undefined | number | false
    }): Promise<this> {
        await saveDataWithStream(
            this._data,
            path,
            encoding,
            showItemIndexEveryX,
            this.verbose
        )

        return this
    }
    @logCall()
    saveData({
        path,
        dataAsArrays = false,
        encoding = "utf8",
    }: {
        path: string
        dataAsArrays?: boolean
        encoding?: BufferEncoding
    }): this {
        saveData(this._data, path, dataAsArrays, encoding, this.verbose)

        return this
    }

    @logCall()
    saveChart({
        path,
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
        path: string
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
    }): this {
        saveChart(
            this._data,
            path,
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
            smallMultipleHeight,
            this.verbose
        )

        return this
    }

    @logCall()
    saveCustomChart({
        path,
        plotOptions,
    }: {
        path: string
        plotOptions: object
    }): this {
        saveCustomChart(path, plotOptions, this.verbose)

        return this
    }
}
