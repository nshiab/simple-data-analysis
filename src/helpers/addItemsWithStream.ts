import { SimpleDataItem } from "../types/SimpleData.types"
import { parse } from "csv-parse"
import { createReadStream } from "fs"
import log from "./log.js"
import getExtension from "./getExtension.js"

export default function readFileWithStream(
    parsedData: SimpleDataItem[],
    path: string,
    encoding: BufferEncoding,
    verbose: boolean
): Promise<void> {
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

    return new Promise((resolve, reject) => {
        createReadStream(path)
            .pipe(
                parse({
                    delimiter: delimiter,
                    columns: true,
                    encoding: encoding,
                })
            )
            .on("data", (item) => parsedData.push(item))
            .on("error", (error) => {
                console.log(error.message)
                reject()
            })
            .on("end", () => {
                verbose && log(`Done with ${path}`, "blue")
                resolve()
            })
    })
}
