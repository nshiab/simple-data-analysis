import SimpleData from "../class/SimpleData";
import checkEnvironment from "../helpers/checkEnvironment";
import log from "../helpers/log";
import { Options, defaultOptions } from "../types"
import showTable from "../methods/showTable";


export default async function loadData(path: string, options: Options) {

    options = {
        ...defaultOptions,
        ...options
    }

    let arrayOfObjects: any = []

    const environment = checkEnvironment()

    const pathSplit = path.split(".")
    const fileExtension = pathSplit[pathSplit.length - 1].toLocaleLowerCase()

    options.logs && log("Detected " + fileExtension + " file extension", "blue")

    if (environment === "nodejs") {

        const fs = await import("fs")

        options.logs && log('=> Running in NodeJS', "blue")

        if (fileExtension === "csv") {

            options.logs && log('=> Csv file extension detected', "blue")

            const Papa = (await import("papaparse")).default

            const csvString = fs.readFileSync(path, { encoding: options.encoding })

            arrayOfObjects = Papa.parse(csvString, { header: true, dynamicTyping: true }).data

            const keys = Object.keys(arrayOfObjects[0])
            const missingValues = Object.keys(options.missingValues)

            for (let i = 0; i < arrayOfObjects.length; i++) {
                for (let j = 0; j < keys.length; j++) {
                    if (missingValues.includes(arrayOfObjects[i][keys[j]])) {
                        const val = arrayOfObjects[i][keys[j]]
                        arrayOfObjects[i][keys[j]] = options.missingValues[val]
                    }
                }
            }

        } else if (fileExtension === "json") {

            options.logs && log('=> ' + fileExtension + ' file extension detected', "blue")

            arrayOfObjects = JSON.parse(fs.readFileSync(path, { encoding: options.encoding }))

        } else {
            throw new Error("Unknown file extension " + fileExtension);
        }

        options.logs && showTable(arrayOfObjects, options)

        const simpleData = new SimpleData(arrayOfObjects, options)

        return simpleData

    } else if (environment === "webBrowser") {

        options.logs && console.log('=> Running in the browser')

        throw new Error("Not implemented yet")
    }

}