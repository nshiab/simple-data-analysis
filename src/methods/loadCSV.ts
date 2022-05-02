// @ts-ignore
import { autoType } from "d3-dsv"
import SimpleData from "../class/SimpleData.js";
import { Options, defaultOptions } from "../types.js"

interface loadCsvOptions extends Options {
    encoding: BufferEncoding
}

const loadCsvOptionsDefault: loadCsvOptions = {
    ...defaultOptions,
    encoding: "utf-8"
}

export default async function loadCSV(path: string, opts: loadCsvOptions) {

    const options: loadCsvOptions = {
        ...loadCsvOptionsDefault,
        ...opts
    }

    options.logs && console.log('\nloadCSV()', path, options)

    if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {

        options.logs && console.log('=> Running in NodeJS')

        // TODO: replace with streams https://www.npmjs.com/package/stream-csv-as-json

        const fs = await import("fs")

        // @ts-ignore
        const { csvParse } = await import("d3-dsv")

        const dataRaw = fs.readFileSync(path, { encoding: options.encoding })

        const jsonData = csvParse(dataRaw, autoType)

        // @ts-ignore
        delete jsonData["columns"]

        // @ts-ignore
        const simpleData = new SimpleData(jsonData)

        options.logs && console.log("=>", simpleData)

        return simpleData

    } else {

        options.logs && console.log('=> Running in the browser')

        // @ts-ignore
        const { csv } = await import("d3-fetch");

        console.log(csv)

    }
}