import checkEnvironment from "../helpers/checkEnvironment.js";
import log from "../helpers/log.js";
import getExtension from "../helpers/getExtension.js";
import fs from "fs"
import Papa from "papaparse"
import { SimpleDataItem } from "../types/SimpleData.types.js";

export default function loadLocalFile({
    path,
    verbose = false,
    missingKeyValues,
    encoding = "utf8"
}: {
    path: string,
    verbose: boolean,
    missingKeyValues: SimpleDataItem,
    encoding: BufferEncoding
}): SimpleDataItem[] {

    let arrayOfObjects: any[] = []

    const environment = checkEnvironment()

    const fileExtension = getExtension(path)

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (environment === "nodejs") {

        verbose && log('=> Running in NodeJS', "blue")

        if (fileExtension === "csv") {

            verbose && log('=> Csv file extension detected', "blue")

            const csvString = fs.readFileSync(path, { encoding: encoding })

            arrayOfObjects = Papa.parse(csvString, { header: true, dynamicTyping: true }).data as SimpleDataItem[]

            const keys = Object.keys(arrayOfObjects[0])
            const missingValueKeys = Object.keys(missingKeyValues)

            for (let i = 0; i < arrayOfObjects.length; i++) {
                for (let j = 0; j < keys.length; j++) {
                    if (missingValueKeys.includes(arrayOfObjects[i][keys[j]])) {
                        const val = arrayOfObjects[i][keys[j]]
                        arrayOfObjects[i][keys[j]] = missingKeyValues[val]
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

    return []

}