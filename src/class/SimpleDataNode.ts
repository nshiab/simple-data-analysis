import fs from "fs"
import { JSDOM } from "jsdom"
import SimpleData from "./SimpleData.js"
import { SimpleDataItem } from "../types/SimpleData.types"
import loadDataFromLocalFile_ from "../methods/importing/loadDataFromLocalFile.js"
import saveData_ from "../methods/exporting/saveData.js"
import { logCall, asyncLogCall } from "../helpers/logCall.js"
import checkKeys from "../helpers/checkKeys.js"
import log from "../helpers/log.js"
import loadDataFromUrlAxios_ from "../methods/importing/loadDataFromUrlAxios.js"

export default class SimpleDataNode extends SimpleData {
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    // ** OVERWRITING METHODS ** //

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
        const data = await loadDataFromUrlAxios_({
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

    // ** SPECIFIC NODEJS METHODS ** //

    @logCall()
    loadDataFromLocalFile({
        path,
        missingKeyValues = { null: null, NaN: NaN, undefined: undefined },
        encoding = "utf8",
        fillMissingKeys = false,
    }: {
        path: string
        encoding?: BufferEncoding
        missingKeyValues?: SimpleDataItem
        fillMissingKeys?: boolean
    }): SimpleDataNode {
        if (this._data.length > 0) {
            throw new Error(
                "This SimpleData already has data. Create another one."
            )
        }

        const data = loadDataFromLocalFile_({
            path: path,
            verbose: this.verbose,
            missingKeyValues: missingKeyValues,
            encoding: encoding,
        })

        if (data.length === 0) {
            throw new Error("Incoming data is empty.")
        }

        checkKeys(data, fillMissingKeys, this.verbose)

        this.#updateSimpleData(data)

        return this
    }

    @logCall()
    saveData({
        path,
        encoding = "utf8",
    }: {
        path: string
        encoding?: BufferEncoding
    }): SimpleDataNode {
        saveData_(this._data, path, this.verbose, encoding)

        return this
    }

    @logCall()
    saveChart({
        path,
        type,
        x,
        y,
        color,
        marginLeft,
        marginBottom,
    }: {
        path: string
        type: "dot"
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
        marginLeft?: number
        marginBottom?: number
    }): SimpleDataNode {
        if (global.document === undefined) {
            const jsdom = new JSDOM("")
            global.document = jsdom.window.document
        }

        const chart = super.getChart({
            x,
            y,
            type,
            color,
            marginLeft,
            marginBottom,
        })

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart save to ${path}`, "blue")

        return this
    }

    @logCall()
    saveCustomChart({
        path,
        plotOptions,
    }: {
        path: string
        plotOptions: object
    }): SimpleDataNode {
        if (global.document === undefined) {
            const jsdom = new JSDOM("")
            global.document = jsdom.window.document
        }
        const chart = super.getCustomChart({ plotOptions })

        fs.writeFileSync(path, chart)
        this.verbose && log(`=> chart save to ${path}`, "blue")

        return this
    }
}
