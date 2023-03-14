import { readFileSync } from "fs"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { log, parseDataFile, getExtension } from "../../exports/helpers.js"

export default function loadDataFromLocalFile(
    path: string | string[],
    autoType = false,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
    nbFirstRowsToExclude = 0,
    nbLastRowsToExclude = Infinity,
    fillMissingKeys = false,
    fileNameAsId = false,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    encoding: BufferEncoding = "utf8",
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

        const fileExtension = getExtension(path, verbose)

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

        if (fileNameAsId) {
            const filePathSplit = path.split("/")
            const fileName = filePathSplit[filePathSplit.length - 1]
            for (let i = 0; i < parsedData.length; i++) {
                parsedData[i].id = fileName
            }
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }

    return arrayOfObjects
}
