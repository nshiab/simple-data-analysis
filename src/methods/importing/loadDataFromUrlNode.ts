import axios from "axios"
import { SimpleDataItem } from "../../types/SimpleData.types"
import { log, parseDataFile, getExtension } from "../../exports/helpers.js"

export default async function loadDataFromUrlNode(
    url: string | string[],
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
    verbose = false
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
            const filePathSplit = url.split("/")
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
