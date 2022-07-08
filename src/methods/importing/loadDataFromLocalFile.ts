import log from "../../helpers/log.js"
import getExtension from "../../helpers/getExtension.js"
import fs from "fs"
import { csvParse, tsvParse, autoType } from "d3-dsv"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function loadDataFromLocalFile(
    path: string,
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
    let arrayOfObjects: any[] = []

    const fileExtension = getExtension(path)

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (fileExtension === "csv" || fileExtension === "tsv") {
        verbose && log(`=> ${fileExtension} file extension detected`, "blue")

        const dsvString = fs.readFileSync(path, { encoding: encoding })

        if (fileExtension === "csv") {
            arrayOfObjects = csvParse(dsvString, autoType) as SimpleDataItem[]
        } else if (fileExtension === "tsv") {
            arrayOfObjects = tsvParse(dsvString, autoType) as SimpleDataItem[]
        }

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
            log("=> " + fileExtension + " file extension detected", "blue")

        arrayOfObjects = JSON.parse(
            fs.readFileSync(path, { encoding: encoding })
        )
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
