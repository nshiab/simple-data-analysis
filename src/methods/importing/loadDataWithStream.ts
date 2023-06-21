import { addItemsWithStream } from "../../exports/helpersNode.js"
import { addFileNameAsValue } from "../../exports/helpers.js"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default async function loadDataWithStream(
    path: string | string[],
    specificKeys: undefined | false | string[],
    fileNameAsValue: boolean,
    encoding: BufferEncoding,
    showItemIndexEveryX: undefined | number | false,
    format: undefined | "csv" | "tsv" = undefined,
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
        await addItemsWithStream(
            parsedData,
            path,
            specificKeys,
            encoding,
            showItemIndexEveryX,
            format,
            verbose
        )
        if (fileNameAsValue) {
            addFileNameAsValue(path, parsedData)
        }

        for (let i = 0; i < parsedData.length; i++) {
            arrayOfObjects.push(parsedData[i])
        }
    }

    return arrayOfObjects
}
