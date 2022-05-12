import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore

export default async function saveData(data: SimpleDataItem[], path: string, options: Options) {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\saveData() " + path)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    if (options.environment === "nodejs") {

        const fs = await import("fs")

        const pathSplit = path.split(".")
        const extension = pathSplit[pathSplit.length - 1].toLowerCase()

        if (extension === "csv") {

            //@ts-ignore
            const Papa = (await import("papaparse")).default

            options.logs && log("=> Csv file extension detected", "blue")
            const csvString = Papa.unparse(data)

            fs.writeFileSync(path, csvString, { encoding: options.encoding })

        } else if (extension === "json" || extension === "geojson") {

            options.logs && log("=> " + extension + " file extension detected", "blue")
            fs.writeFileSync(path, JSON.stringify(data), { encoding: options.encoding })

        } else {

            throw new Error("Unknow file extension")

        }

    } else {
        throw new Error("Can't create a file locally from the browser")
    }

    options.logs && log("=> Data written to " + path, "blue")
    options.logs && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

}