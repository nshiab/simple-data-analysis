import { autoType } from "d3-dsv"
import { csv, json } from "d3-fetch"
import getExtension from "../../helpers/getExtension.js"
import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataFromUrlWeb({
    url,
    verbose = false,
    missingKeyValues,
}: {
    url: string
    verbose: boolean
    missingKeyValues: SimpleDataItem
}): Promise<SimpleDataItem[]> {
    const fileExtension = getExtension(url)

    let arrayOfObjects: any[] = []

    if (fileExtension === "csv") {
        verbose && log("=> Csv file extension detected", "blue")

        arrayOfObjects = await csv(url, autoType)

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
        arrayOfObjects = (await json(url)) as any[]
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
