import getExtension from "../../helpers/getExtension.js"
import { readFileSync, readdirSync } from "fs"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import parseDataFile from "../../helpers/parseDataFile.js"
import log from "../../helpers/log.js"

export default function loadDataFromLocalDirectory(
    path: string,
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

        const fileExtension = getExtension(filePath, verbose)

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
                verbose
            )
        )
    }

    return arrayOfObjects
}
