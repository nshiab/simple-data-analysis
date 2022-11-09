import axios from "axios"
import { csvParse, tsvParse, autoType as typed } from "d3-dsv"
import arraysToData from "../../helpers/arraysToData.js"
import getExtension from "../../helpers/getExtension.js"
import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataFromUrlNode(
    url: string,
    autoType = false,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
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

    const fileExtension = getExtension(url)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let arrayOfObjects: any[] = []

    verbose && log("Detected " + fileExtension + " file extension", "blue")

    if (fileExtension === "csv" || fileExtension === "tsv") {
        if (fileExtension === "csv") {
            arrayOfObjects = autoType
                ? (csvParse(data, typed) as SimpleDataItem[])
                : (csvParse(data) as SimpleDataItem[])
        } else if (fileExtension === "tsv") {
            arrayOfObjects = autoType
                ? (tsvParse(data, typed) as SimpleDataItem[])
                : (tsvParse(data) as SimpleDataItem[])
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete arrayOfObjects["columns" as any]
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)

        const keys = Object.keys(arrayOfObjects[0])
        const missingValueKeys = Object.keys(missingKeyValues)

        for (let i = 0; i < arrayOfObjects.length; i++) {
            for (let j = 0; j < keys.length; j++) {
                if (missingValueKeys.includes(arrayOfObjects[i][keys[j]])) {
                    const val = arrayOfObjects[i][keys[j]]
                    arrayOfObjects[i][keys[j]] = missingKeyValues[val]
                }
            }
        }
    } else if (fileExtension === "json") {
        arrayOfObjects = dataAsArrays ? arraysToData(data, noTest) : data
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
