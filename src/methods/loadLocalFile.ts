import checkEnvironment from "../helpers/checkEnvironment.js";
import log from "../helpers/log.js";
import getExtension from "../helpers/getExtension.js";
import fs from "fs"
import Papa from "papaparse"

export default function loadLocalFile({
    path,
    verbose = false,
    missingValues,
    encoding = "utf8"
}: {
    path: string,
    verbose?: boolean,
    missingValues?: { [key: string]: any },
    encoding?: BufferEncoding
}) {

    if (missingValues === undefined) {
        missingValues = { "null": null, "NaN": NaN, "undefined": undefined }
    }

    let arrayOfObjects: any = []

    const environment = checkEnvironment()

    const fileExtension = getExtension(path)

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (environment === "nodejs") {

        verbose && log('=> Running in NodeJS', "blue")

        if (fileExtension === "csv") {

            verbose && log('=> Csv file extension detected', "blue")

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

        return arrayOfObjects

    } else if (environment === "webBrowser") {

        verbose && console.log('=> Running in the browser')

        throw new Error("Not implemented yet")
    }

}