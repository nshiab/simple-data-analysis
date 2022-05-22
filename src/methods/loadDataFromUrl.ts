import axios from "axios"
import { csvParse, autoType } from "d3-dsv"
import getExtension from "../helpers/getExtension.js"
import log from "../helpers/log.js"
import { SimpleDataItem } from "../types/SimpleData.types"

export default async function loadUrl({
    url,
    verbose = false,
    missingKeyValues,
    encoding,
}: {
    url: string
    verbose: boolean
    missingKeyValues: SimpleDataItem
    encoding: BufferEncoding
}): Promise<SimpleDataItem[]> {
    const request = await axios.get(url)
    const data = request.data

    const fileExtension = getExtension(url)

    let arrayOfObjects: any[] = []

    if (fileExtension === "csv") {
        verbose && log("=> Csv file extension detected", "blue")

        arrayOfObjects = csvParse(data, autoType)

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
        arrayOfObjects = JSON.parse(data)
    } else {
        throw new Error("Unknown file extension " + fileExtension)
    }

    return arrayOfObjects
}
