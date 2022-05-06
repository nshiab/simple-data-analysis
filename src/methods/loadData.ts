// @ts-ignore
import { autoType } from "d3-dsv"
import SimpleData from "../class/SimpleData.js";
import { checkEnvironment } from "../helpers/checkEnvironment.js";
import log from "../helpers/log.js";
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

    options.logs && log('\nloadData(),' + path)
    options.logOptions && log(options, "blue")

    // TODO: add other formats than csv

    let arrayOfObjects: any[] = []

    const environment = checkEnvironment()

    if (environment === "nodejs") {

        options.logs && console.log('=> Running in NodeJS')

        // TODO: replace with streams https://www.npmjs.com/package/stream-csv-as-json

        const fs = await import("fs")

        if (options.format === "csv") {
            // @ts-ignore
            const { csvParse } = await import("d3-dsv")

            const dataRaw = fs.readFileSync(path, { encoding: options.encoding })

            const parsedCsv = csvParse(dataRaw, autoType)

            // For some reason, csvParse don't always parse null, undefined and NaN and keep them as strings
            const valuesToReplace = ["undefined", "NaN", "null"]
            const correctValues = [undefined, NaN, null]
            for (let i = 0; i < parsedCsv.length; i++) {
                for (let col of parsedCsv["columns"]) {
                    const val = parsedCsv[i][col]
                    const index = valuesToReplace.indexOf(val)
                    if (index > -1) {
                        //@ts-ignore
                        parsedCsv[i][col] = correctValues[index]
                    }
                }
            }

            // @ts-ignore
            delete parsedCsv["columns"]

            arrayOfObjects = parsedCsv
        }


        // @ts-ignore
        options.logs && showTable(arrayOfObjects, options.nbItemInTable)

        // @ts-ignore
        const simpleData = new SimpleData(arrayOfObjects)


        return simpleData

    } else if (environment === "webBrowser") {

        options.logs && console.log('=> Running in the browser')

        if (options.format === "csv") {

            // @ts-ignore
            const { csv } = await import("d3-fetch");

        }

    }
}