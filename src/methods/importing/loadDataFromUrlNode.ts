import axios from "axios"
import getExtension from "../../helpers/getExtension.js"
import log from "../../helpers/log.js"
import parseDataFile from "../../helpers/parseDataFile.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataFromUrlNode(
    url: string | string[],
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
    const urls: string[] = []
    const arrayOfObjects: SimpleDataItem[] = []

    if (typeof url === "string") {
        urls.push(url)
    } else {
        urls.push(...url)
    }

    for (const url of urls) {
        verbose && log(`Fetching ${url}...`, "blue")
        const request = await axios.get(url)
        const data = request.data

        const fileExtension = getExtension(url, verbose)

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
