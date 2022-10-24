import log from "../../helpers/log.js"
import getExtension from "../../helpers/getExtension.js"
import fs from "fs"
import { csvParse, tsvParse, autoType as typed } from "d3-dsv"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import arraysToData from "../../helpers/arraysToData.js"

export default function loadDataFromLocalFile(
    path: string,
    autoType = false,
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

    const fileExtension = getExtension(path)

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (fileExtension === "csv" || fileExtension === "tsv") {
        const dsvString = fs.readFileSync(path, { encoding: encoding })

        if (fileExtension === "csv") {
            arrayOfObjects = autoType
                ? (csvParse(dsvString, typed) as SimpleDataItem[])
                : (csvParse(dsvString) as SimpleDataItem[])
        } else if (fileExtension === "tsv") {
            arrayOfObjects = autoType
                ? (tsvParse(dsvString, typed) as SimpleDataItem[])
                : (tsvParse(dsvString) as SimpleDataItem[])
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
        const incomingData = JSON.parse(
            fs.readFileSync(path, { encoding: encoding })
        )
        arrayOfObjects = dataAsArrays
            ? arraysToData(incomingData)
            : incomingData
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
