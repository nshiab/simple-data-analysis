import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import { csvParse, tsvParse, autoType as typed } from "d3-dsv"
import { log, handleMissingKeys, arraysToData } from "../exports/helpers.js"

export default function parseDataFile(
    data: string | { [key: string]: SimpleDataValue[] },
    fileExtension: string,
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
    headers: undefined | string[] = undefined,
    verbose = false
): SimpleDataItem[] {
    verbose && log(`Parsing the data...`, "blue")

    let arrayOfObjects: SimpleDataItem[] = []

    if (
        typeof data === "string" &&
        (fileExtension === "csv" || fileExtension === "tsv")
    ) {
        if (nbFirstRowsToExclude !== 0 || nbLastRowsToExclude !== Infinity) {
            const dataSplit = data.split("\n")

            data = dataSplit
                .slice(
                    nbFirstRowsToExclude,
                    dataSplit.length - nbLastRowsToExclude
                )
                .join("\n") as string
        }

        if (headers) {
            if (!["csv", "tsv"].includes(fileExtension)) {
                throw new Error(
                    "headers can also be used with csv or tsv files"
                )
            } else {
                data = `${headers.join(",")}\n${data}`
            }
        }

        if (fileExtension === "csv") {
            arrayOfObjects = autoType
                ? (csvParse(data, typed) as SimpleDataItem[])
                : (csvParse(data) as SimpleDataItem[])
        } else if (fileExtension === "tsv") {
            arrayOfObjects = autoType
                ? (tsvParse(data, typed) as SimpleDataItem[])
                : (tsvParse(data) as SimpleDataItem[])
        }

        delete arrayOfObjects["columns" as unknown as number] // weird
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)

        const keys = Object.keys(arrayOfObjects[0])
        const missingValueKeys = Object.keys(missingKeyValues)

        for (let i = 0; i < arrayOfObjects.length; i++) {
            for (let j = 0; j < keys.length; j++) {
                if (
                    missingValueKeys.includes(
                        arrayOfObjects[i][keys[j]] as string
                    )
                ) {
                    const val = arrayOfObjects[i][keys[j]]
                    arrayOfObjects[i][keys[j]] = missingKeyValues[val as string]
                }
            }
        }
    } else if (fileExtension === "json" && typeof data === "string") {
        const incomingData = JSON.parse(data)
        arrayOfObjects = dataAsArrays
            ? arraysToData(incomingData, verbose)
            : incomingData
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else if (fileExtension === "json" && Array.isArray(data)) {
        arrayOfObjects = data.slice(firstItem, lastItem + 1) as SimpleDataItem[]
    } else if (fileExtension === "json" && typeof data === "object") {
        arrayOfObjects = (
            dataAsArrays ? arraysToData(data, verbose) : data
        ) as SimpleDataItem[]
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    if (arrayOfObjects.length === 0) {
        throw new Error("Incoming data is empty.")
    }

    return handleMissingKeys(
        arrayOfObjects,
        fillMissingKeys,
        undefined,
        undefined,
        verbose
    )
}
