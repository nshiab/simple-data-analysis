import getExtension from "../../helpers/getExtension.js"
import { readFileSync } from "fs"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import parseDataFile from "../../helpers/parseDataFile.js"
import log from "../../helpers/log.js"

export default function loadDataFromLocalFile(
    path: string | string[],
    autoType = false,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
    nbFirstRowsToExclude = 0,
    nbLastRowsToExclude = Infinity,
    fillMissingKeys = false,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    encoding: BufferEncoding = "utf8",
    verbose = false,
    noTest = false
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

        arrayOfObjects.push(
            ...parseDataFile(
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
                verbose,
                noTest
            )
        )
    }

    return arrayOfObjects
}
