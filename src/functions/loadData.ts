import SimpleData from "../class/SimpleData.js";
import checkEnvironment from "../helpers/checkEnvironment.js";
import log from "../helpers/log.js";
import { Options, defaultOptions } from "../types.js"
import showTable from "../methods/showTable.js";


export default async function loadData(path: string, options: Options) {

    // On doit garder les options
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

            //@ts-ignore
            const Papa = (await import("papaparse")).default

            const csvString = fs.readFileSync(path, { encoding: options.encoding })

            arrayOfObjects = Papa.parse(csvString, { header: true, dynamicTyping: true }).data

            const keys = Object.keys(arrayOfObjects[0])
            const missingValues = Object.keys(options.missingValues)

            for (let i = 0; i < arrayOfObjects.length; i++) {
                for (let j = 0; j < keys.length; j++) {
                    if (missingValues.includes(arrayOfObjects[i][keys[j]])) {
                        arrayOfObjects[i][keys[j]] = options.missingValues[arrayOfObjects[i][keys[j]]]
                    }
                }
            }

        } else if (fileExtension === "json") {

            options.logs && log('=> ' + fileExtension + ' file extension detected', "blue")

            arrayOfObjects = JSON.parse(fs.readFileSync(path, { encoding: options.encoding }))

        } else {
            throw new Error("Unknown file extension " + fileExtension);
        }

        // @ts-ignore
        options.logs && showTable(arrayOfObjects, options.nbItemInTable)

        // @ts-ignore
        const simpleData = new SimpleData(arrayOfObjects, options)

        return simpleData

    } else if (environment === "webBrowser") {

        options.logs && console.log('=> Running in the browser')

        throw new Error("Not implemented yet")
    }

}