import { SimpleDataItem } from "../types/SimpleData.types"
import { parse } from "csv-parse"
import { createReadStream } from "fs"
import log from "./log.js"
import getExtension from "./getExtension.js"
import { finished } from "stream/promises"

export default async function readFileWithStream(
    parsedData: SimpleDataItem[],
    path: string,
    specificKeys: undefined | false | string[],
    encoding: BufferEncoding,
    showItemIndexEveryX: undefined | number | false,
    verbose: boolean
): Promise<void> {
    if (parsedData.length > 0) {
        throw Error("Already data in there")
    }

    const fileExtension = getExtension(path, verbose)

    if (!["csv", "tsv"].includes(fileExtension)) {
        throw new Error("stream works with csv and tsv files only.")
    }
    let delimiter = ""
    if (fileExtension === "csv") {
        delimiter = ","
    } else {
        delimiter = "\t"
    }

    let index = 0

    const parser = createReadStream(path).pipe(
        parse({
            delimiter: delimiter,
            columns: true,
            encoding: encoding,
        })
    )

    parser.on("readable", function () {
        let item
        while ((item = parser.read()) !== null) {
            // Work with each record
            if (specificKeys && specificKeys.length > 0) {
                const newItem: SimpleDataItem = {}
                for (let i = 0; i < specificKeys.length; i++) {
                    const key = specificKeys[i]
                    newItem[key] = item[key]
                }
                parsedData.push(newItem)
            } else {
                parsedData.push(item)
            }

            if (typeof showItemIndexEveryX === "number") {
                index % showItemIndexEveryX === 0 &&
                    log(`Item ${index}`, "blue")
                index += 1
            }
        }
    })

    await finished(parser)
}
