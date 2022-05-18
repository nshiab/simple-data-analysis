import SimpleData from "../class/SimpleData.js";
import checkEnvironment from "../helpers/checkEnvironment.js";
import log from "../helpers/log.js";
import showTable from "../methods/showTable.js";
import getExtension from "../helpers/getExtension.js";


export default async function loadData({
    path, 
    verbose = false, 
    logParameters = false, 
    nbTableItemsToLog = 5, 
    missingValues,
    encoding = "utf8"
}: {
    path: string, 
    verbose: boolean, 
    logParameters: boolean, 
    nbTableItemsToLog: number, 
    missingValues? : {[key: string]: any},
    encoding: BufferEncoding
}){

    if (missingValues === undefined){
        missingValues = { "null": null, "NaN": NaN, "undefined": undefined }
    }

    let arrayOfObjects: any = []

    const environment = checkEnvironment()

    const fileExtension = getExtension(path)

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (environment === "nodejs") {

        const fs = await import("fs")

        verbose && log('=> Running in NodeJS', "blue")

        if (fileExtension === "csv") {

            verbose && log('=> Csv file extension detected', "blue")

            const Papa = (await import("papaparse")).default

            const csvString = fs.readFileSync(path, { encoding: encoding })

            arrayOfObjects = Papa.parse(csvString, { header: true, dynamicTyping: true }).data

            const keys = Object.keys(arrayOfObjects[0])
            const missingValueKeys = Object.keys(missingValues)

            for (let i = 0; i < arrayOfObjects.length; i++) {
                for (let j = 0; j < keys.length; j++) {
                    if (missingValueKeys.includes(arrayOfObjects[i][keys[j]])) {
                        const val = arrayOfObjects[i][keys[j]]
                        arrayOfObjects[i][keys[j]] = missingValues[val]
                    }
                }
            }

        } else if (fileExtension === "json") {

            verbose && log('=> ' + fileExtension + ' file extension detected', "blue")

            arrayOfObjects = JSON.parse(fs.readFileSync(path, { encoding: encoding }))

        } else {
            throw new Error("Unknown file extension " + fileExtension);
        }

        verbose && showTable(arrayOfObjects, nbTableItemsToLog)

        const simpleData = new SimpleData(arrayOfObjects, {
            verbose, 
            logParameters, 
            nbTableItemsToLog
    })

        return simpleData

    } else if (environment === "webBrowser") {

        verbose && console.log('=> Running in the browser')

        throw new Error("Not implemented yet")
    }

}