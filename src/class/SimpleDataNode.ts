import fs from "fs"
import { JSDOM } from "jsdom"
import SimpleData from "./SimpleData.js"
import { SimpleDataItem } from "../types/SimpleData.types"
import loadDataFromLocalFile_ from "../methods/importing/loadDataFromLocalFile.js"
import saveData_ from "../methods/exporting/saveData.js"
import { logCall, asyncLogCall } from "../helpers/logCall.js"
import handleMissingKeys from "../helpers/handleMissingKeys.js"
import log from "../helpers/log.js"
import loadDataFromUrlNode_ from "../methods/importing/loadDataFromUrlNode.js"
import getChart from "../methods/visualizing/getChart.js"
import getCustomChart from "../methods/visualizing/getCustomChart.js"

export default class SimpleDataNode extends SimpleData {
    // If modified, might need to be modified in SimpleData too
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
    }

    // ** OVERWRITING METHODS ** //

    @asyncLogCall()
    async loadDataFromUrl({
        url,
        autoType = false,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        firstItem = 0,
        lastItem = Infinity,
    }: {
        url: string
        autoType?: boolean
        dataAsArrays?: boolean
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        firstItem?: number
        lastItem?: number
    }): Promise<this> {
        const data = await loadDataFromUrlNode_(
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

        handleMissingKeys(
            data,
            fillMissingKeys,
            undefined,
            undefined,
            this.verbose
        )

        this._tempData = data
        this.#updateSimpleData(data)

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
        firstItem = 0,
        lastItem = Infinity,
    }: {
        path: string
        autoType?: boolean
        dataAsArrays?: boolean
        encoding?: BufferEncoding
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        firstItem?: number
        lastItem?: number
    }): this {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }

        const data = loadDataFromLocalFile_(
            path,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            missingKeyValues,
            encoding,
            this.verbose
        )

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        handleMissingKeys(
            data,
            fillMissingKeys,
            undefined,
            undefined,
            this.verbose
        )

        this._tempData = data // important for decorator
        this.#updateSimpleData(data)

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
        saveData_(this._data, path, dataAsArrays, this.verbose, encoding)

        return this
    }

    @logCall()
    saveChart({
        path,
        type,
        x,
        y,
        color,
        trend = false,
        showTrendEquation = false,
        width,
        height,
        marginLeft = 0,
        marginBottom = 0,
        title,
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
        trend?: boolean
        showTrendEquation?: boolean
        width?: number
        height?: number
        marginLeft?: number
        marginBottom?: number
        title?: string
    }): this {
        if (global.window === undefined || global.document === undefined) {
            const jsdom = new JSDOM("")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            global.window = jsdom.window
            global.document = jsdom.window.document
        }

        const chart = getChart(
            this._data,
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

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart saved to ${path}`, "blue")

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
        if (global.window === undefined || global.document === undefined) {
            const jsdom = new JSDOM("")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            global.window = jsdom.window
            global.document = jsdom.window.document
        }

        const chart = getCustomChart(plotOptions)

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart saved to ${path}`, "blue")

        return this
    }
}
