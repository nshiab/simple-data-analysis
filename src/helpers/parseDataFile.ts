import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import { csvParse, tsvParse, autoType as typed } from "d3-dsv"
import arraysToData from "./arraysToData.js"
import handleMissingKeys from "./handleMissingKeys.js"

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
    verbose = false,
    noTests = false
): SimpleDataItem[] {
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
                .join("\n")
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
            ? arraysToData(incomingData, noTests)
            : incomingData
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else if (fileExtension === "json" && Array.isArray(data)) {
        arrayOfObjects = data.slice(firstItem, lastItem + 1) as SimpleDataItem[]
    } else if (fileExtension === "json" && typeof data === "object") {
        arrayOfObjects = (
            dataAsArrays ? arraysToData(data, noTests) : data
        ) as SimpleDataItem[]
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    if (arrayOfObjects.length === 0) {
        throw new Error("Incoming data is empty.")
    }

    if (noTests && fillMissingKeys) {
        throw new Error("fillMissingKeys cannot be true if noTests is true")
    } else if (!noTests) {
        arrayOfObjects = handleMissingKeys(
            arrayOfObjects,
            fillMissingKeys,
            undefined,
            undefined,
            verbose
        )
    }

    return arrayOfObjects
}
