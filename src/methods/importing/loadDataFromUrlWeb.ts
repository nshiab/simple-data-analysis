import { SimpleDataItem } from "../../types/SimpleData.types"
import {
    log,
    parseDataFile,
    getExtension,
    addFileNameAsValue,
} from "../../exports/helpers.js"

export default async function loadDataFromUrlWeb(
    url: string | string[],
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
    headers: undefined | string[] = undefined,
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

        const request = await fetch(url)
        const data = await request.text()

        const fileExtension = format ? format : getExtension(url, verbose)

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
            addFileNameAsValue(url, parsedData)
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }
    return arrayOfObjects
}
