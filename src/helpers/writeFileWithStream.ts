import { createWriteStream } from "fs"
import getExtension from "./getExtension.js"
import { stringify } from "csv-stringify"
import log from "./log.js"
import { SimpleDataItem } from "../types/SimpleData.types"

export default async function writeFileWithStream(
    data: SimpleDataItem[],
    path: string,
    encoding: BufferEncoding,
    showItemIndexEveryX: undefined | number | false,
    verbose: boolean
): Promise<void> {
    const extension = getExtension(path, verbose)

    if (extension !== "csv") {
        throw new Error("writeFileWithStream works only with csv files")
    }

    return new Promise((resolve, reject) => {
        const writableStream = createWriteStream(path)
        const stringifier = stringify({
            header: true,
            encoding: encoding,
        }).on("error", (error) => {
            console.log(error.message)
            reject()
        })

        for (let i = 0; i < data.length; i++) {
            stringifier.write(data[i], () => {
                if (
                    typeof showItemIndexEveryX === "number" &&
                    i % showItemIndexEveryX == 0
                ) {
                    log(`Item ${i}`, "blue")
                }
            })
        }
        stringifier.pipe(writableStream)
        stringifier.end(() => {
            verbose && log(`Done with ${path}`, "blue")
            resolve()
        })
    })
}
