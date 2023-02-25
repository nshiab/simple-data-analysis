import getExtension from "../../helpers/getExtension.js"
import parseDataFile from "../../helpers/parseDataFile.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataFromUrlWeb(
    url: string,
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
    verbose = false,
    noTest = false
): Promise<SimpleDataItem[]> {
    const request = await fetch(url)
    const data = await request.text()

    const fileExtension = getExtension(url, verbose)

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
