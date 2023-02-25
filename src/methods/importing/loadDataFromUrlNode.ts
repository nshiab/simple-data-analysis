import axios from "axios"
import getExtension from "../../helpers/getExtension.js"
import parseDataFile from "../../helpers/parseDataFile.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataFromUrlNode(
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
    const request = await axios.get(url)
    const data = request.data

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
