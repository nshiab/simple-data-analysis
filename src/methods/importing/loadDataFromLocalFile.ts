import getExtension from "../../helpers/getExtension.js"
import { readFileSync } from "fs"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import parseDataFile from "../../helpers/parseDataFile.js"

export default function loadDataFromLocalFile(
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
    verbose = false,
    noTest = false
): SimpleDataItem[] {
    const fileExtension = getExtension(path, verbose)

    const data = readFileSync(path, { encoding: encoding })

    const arrayOfObjects = parseDataFile(
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
        noTest
    )

    return arrayOfObjects
}
