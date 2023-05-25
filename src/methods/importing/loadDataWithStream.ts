import { addItemsWithStream } from "../../exports/helpersNode.js"
import { addFileNameAsValue } from "../../exports/helpers.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataWithStream(
    path: string | string[],
    fileNameAsValue: boolean,
    encoding: BufferEncoding,
    verbose: boolean
) {
    const paths: string[] = []

    if (typeof path === "string") {
        paths.push(path)
    } else {
        paths.push(...path)
    }

    const arrayOfObjects: SimpleDataItem[] = []

    for (const path of paths) {
        const parsedData: SimpleDataItem[] = []
        await addItemsWithStream(parsedData, path, encoding, verbose)
        if (fileNameAsValue) {
            addFileNameAsValue(path, parsedData)
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }

    return arrayOfObjects
}
