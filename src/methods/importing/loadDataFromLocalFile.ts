import { readFileSync } from "fs"

import { SimpleDataItem } from "../../types/SimpleData.types.js"
import {
    log,
    parseDataFile,
    getExtension,
    addFileNameAsValue,
} from "../../exports/helpers.js"

export default function loadDataFromLocalFile(
    path: string | string[],
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
    format: undefined | "csv" | "tsv" | "json" = undefined,
    encoding: BufferEncoding = "utf8",
    headers: undefined | string[] = undefined,
    verbose = false
): SimpleDataItem[] {
    const paths: string[] = []
    const arrayOfObjects: SimpleDataItem[] = []

    if (typeof path === "string") {
        paths.push(path)
    } else {
        paths.push(...path)
    }

    for (const path of paths) {
        verbose && log(`Reading ${path} with encoding ${encoding}...`, "blue")

        const data = readFileSync(path, { encoding: encoding })

        const fileExtension = format ? format : getExtension(path, verbose)

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
            headers,
            verbose
        )

        if (fileNameAsValue) {
            addFileNameAsValue(path, parsedData)
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }

    return arrayOfObjects
}
