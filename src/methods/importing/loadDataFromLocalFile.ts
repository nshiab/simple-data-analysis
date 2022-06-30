import log from "../../helpers/log.js"
import getExtension from "../../helpers/getExtension.js"
import fs from "fs"
import { csvParse, autoType } from "d3-dsv"
import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function loadDataFromLocalFile(
    path: string,
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

    if (fileExtension === "csv") {
        verbose && log("=> Csv file extension detected", "blue")

        const csvString = fs.readFileSync(path, { encoding: encoding })

        arrayOfObjects = csvParse(csvString, autoType) as SimpleDataItem[]

        delete arrayOfObjects["columns" as any]

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
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
