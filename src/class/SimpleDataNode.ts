import fs from "fs"
import { JSDOM } from "jsdom"

import { SimpleData } from "./index.js"
import { SimpleDataItem } from "../types/index.js"
import exporting from "../methods/exporting/indexNode.js"
import importing from "../methods/importing/indexNode.js"
import visualizing from "../methods/visualizing/index.js"
import helpers from "../helpers/index.js"

export default class SimpleDataNode extends SimpleData {
    // If modified, might need to be modified in SimpleData too
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
    }

    // ** OVERWRITING METHODS ** //

    @helpers.asyncLogCall()
    async loadDataFromUrl({
        url,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        fillMissingKeys = false,
        firstItem = 0,
        lastItem = Infinity,
    }: {
        url: string
        dataAsArrays?: boolean
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
        firstItem?: number
        lastItem?: number
    }): Promise<this> {
        const data = await importing.loadDataFromUrlNode_(
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

        this._tempData = data
        this.#updateSimpleData(data)

        return this
    }

    // ** SPECIFIC NODEJS METHODS ** //

    @helpers.logCall()
    loadDataFromLocalFile({
        path,
        dataAsArrays = false,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        encoding = "utf8",
        fillMissingKeys = false,
        firstItem = 0,
        lastItem = Infinity,
    }: {
        path: string
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

        const data = importing.loadDataFromLocalFile_(
            path,
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

    @helpers.logCall()
    saveData({
        path,
        dataAsArrays = false,
        encoding = "utf8",
    }: {
        path: string
        dataAsArrays?: boolean
        encoding?: BufferEncoding
    }): this {
        exporting.saveData_(
            this._data,
            path,
            dataAsArrays,
            this.verbose,
            encoding
        )

        return this
    }

    @helpers.logCall()
    saveChart({
        path,
        type,
        x,
        y,
        color,
        trend = false,
        showTrendEquation = false,
        marginLeft = 0,
        marginBottom = 0,
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
        marginLeft?: number
        marginBottom?: number
    }): this {
        if (global.window === undefined || global.document === undefined) {
            const jsdom = new JSDOM("")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            global.window = jsdom.window
            global.document = jsdom.window.document
        }

        const chart = visualizing.getChart_(
            this._data,
            type,
            x,
            y,
            color,
            trend,
            showTrendEquation,
            marginLeft,
            marginBottom
        )

        fs.writeFileSync(path, chart)
        this.verbose && helpers.log(`=> chart saved to ${path}`, "blue")

        return this
    }

    @helpers.logCall()
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

        const chart = visualizing.getCustomChart_(plotOptions)

        fs.writeFileSync(path, chart)
        this.verbose && helpers.log(`=> chart saved to ${path}`, "blue")

        return this
    }
}
