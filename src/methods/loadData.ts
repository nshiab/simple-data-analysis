// @ts-ignore
import { autoType } from "d3-dsv"
import SimpleData from "../class/SimpleData.js";
import { Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js";

interface loadCsvOptions extends Options {
    encoding: BufferEncoding,
    format: string
}

const loadCsvOptionsDefault: loadCsvOptions = {
    ...defaultOptions,
    format: "csv",
    encoding: "utf-8"
}

export default async function loadData(path: string, options: loadCsvOptions) {

    options = {
        ...loadCsvOptionsDefault,
        ...options
    }

    options.logs && console.log('\nloadData()', path, options)

    // TODO: add other formats than csv

    let arrayOfObjects: any[] = []

    if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {

        options.logs && console.log('=> Running in NodeJS')

        // TODO: replace with streams https://www.npmjs.com/package/stream-csv-as-json

        const fs = await import("fs")

        if (options.format === "csv") {
            // @ts-ignore
            const { csvParse } = await import("d3-dsv")

            const dataRaw = fs.readFileSync(path, { encoding: options.encoding })

            const parsedCsv = csvParse(dataRaw, autoType)

            // @ts-ignore
            delete parsedCsv["columns"]

            arrayOfObjects = parsedCsv
        }


        // @ts-ignore
        options.logs && showTable(arrayOfObjects, options.nbItemInTable)

        // @ts-ignore
        const simpleData = new SimpleData(arrayOfObjects)


        return simpleData

    } else {

        options.logs && console.log('=> Running in the browser')

        if (options.format === "csv") {

            // @ts-ignore
            const { csv } = await import("d3-fetch");

        }

    }
}