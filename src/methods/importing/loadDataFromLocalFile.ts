import fs from "fs"
import { csvParse, tsvParse, autoType } from "d3-dsv"

import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default function loadDataFromLocalFile(
    path: string,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    encoding: BufferEncoding = "utf8",
    verbose = false
): SimpleDataItem[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let arrayOfObjects: any[] = []

    const fileExtension = helpers.getExtension(path)

    verbose &&
        helpers.log("Detected " + fileExtension + " file extension", "blue")

    if (fileExtension === "csv" || fileExtension === "tsv") {
        verbose &&
            helpers.log(`=> ${fileExtension} file extension detected`, "blue")

        const dsvString = fs.readFileSync(path, { encoding: encoding })

        if (fileExtension === "csv") {
            arrayOfObjects = csvParse(dsvString, autoType) as SimpleDataItem[]
        } else if (fileExtension === "tsv") {
            arrayOfObjects = tsvParse(dsvString, autoType) as SimpleDataItem[]
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete arrayOfObjects["columns" as any]
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)

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
        verbose &&
            helpers.log(
                "=> " + fileExtension + " file extension detected",
                "blue"
            )

        const incomingData = JSON.parse(
            fs.readFileSync(path, { encoding: encoding })
        )
        arrayOfObjects = dataAsArrays
            ? helpers.arraysToData(incomingData)
            : incomingData
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
