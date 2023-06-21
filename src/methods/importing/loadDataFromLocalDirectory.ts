import { readFileSync, readdirSync } from "fs"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import {
    log,
    parseDataFile,
    getExtension,
    addFileNameAsValue,
} from "../../exports/helpers.js"

export default function loadDataFromLocalDirectory(
    path: string,
    autoType = false,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
    nbFirstRowsToExclude = 0,
    nbLastRowsToExclude = Infinity,
    fillMissingKeys = false,
    fileNameAsValue = false,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    encoding: BufferEncoding = "utf8",
    format: undefined | "csv" | "tsv" | "json" = undefined,
    verbose = false
): SimpleDataItem[] {
    const files = readdirSync(path)

    verbose &&
        log(`Files in the directory: ${JSON.stringify(files, undefined, 1)}`)

    const arrayOfObjects: SimpleDataItem[] = []

    for (const filePath of files.map((d) => `${path}${d}`)) {
        verbose &&
            log(`Reading ${filePath} with encoding ${encoding}...`, "blue")
        const data = readFileSync(filePath, { encoding: encoding })

        const fileExtension = format ? format : getExtension(filePath, verbose)
        const parsedData = parseDataFile(
            data,
            fileExtension,
            autoType,
            dataAsArrays,
            firstItem,
            lastItem,
            nbFirstRowsToExclude,
            nbLastRowsToExclude,
            fillMissingKeys,
            missingKeyValues,
            verbose
        )

        if (fileNameAsValue) {
            addFileNameAsValue(filePath, parsedData)
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }

    return arrayOfObjects
}
