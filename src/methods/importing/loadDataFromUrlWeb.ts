import { autoType } from "d3-dsv"
import { csv, tsv, json } from "d3-fetch"

import { SimpleDataItem, SimpleDataValue } from "../../types/index.js"
import helpers from "../../helpers/index.js"

export default async function loadDataFromUrlWeb(
    url: string,
    dataAsArrays = false,
    firstItem = 0,
    lastItem = Infinity,
    missingKeyValues: SimpleDataItem = {
        null: null,
        NaN: NaN,
        undefined: undefined,
    },
    verbose = false
): Promise<SimpleDataItem[]> {
    const fileExtension = helpers.getExtension(url)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let arrayOfObjects: any[] = []

    if (fileExtension === "csv" || fileExtension === "tsv") {
        verbose &&
            helpers.log(`=> ${fileExtension} file extension detected`, "blue")

        if (fileExtension === "csv") {
            arrayOfObjects = await csv(url, autoType)
        } else if (fileExtension === "tsv") {
            arrayOfObjects = await tsv(url, autoType)
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const incomingData = (await json(url)) as any[]
        arrayOfObjects = dataAsArrays
            ? helpers.arraysToData(
                  incomingData as unknown as {
                      [key: string]: SimpleDataValue[]
                  }
              )
            : incomingData
        arrayOfObjects = arrayOfObjects.slice(firstItem, lastItem + 1)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
