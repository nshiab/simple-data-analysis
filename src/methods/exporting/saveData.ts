import fs from "fs"
import { parse } from "json2csv"

import { SimpleDataItem } from "../../types/index.js"
import { getExtension, log } from "../../helpers/index.js"
import { getDataAsArrays_ } from "./index.js"

export default async function saveData(
    data: SimpleDataItem[],
    path: string,
    dataAsArrays: boolean,
    verbose: boolean,
    encoding: BufferEncoding
) {
    const extension = getExtension(path)

    if (extension === "csv") {
        verbose && log("=> Csv file extension detected", "blue")
        const csvString = parse(data)

        fs.writeFileSync(path, csvString, { encoding: encoding })
    } else if (extension === "json") {
        verbose && log("=> " + extension + " file extension detected", "blue")
        if (dataAsArrays) {
            verbose && log("=> data as arrays", "blue")
            fs.writeFileSync(path, JSON.stringify(getDataAsArrays_(data)), {
                encoding: encoding,
            })
        } else {
            fs.writeFileSync(path, JSON.stringify(data), { encoding: encoding })
        }
    } else {
        throw new Error("Unknow file extension")
    }

    verbose && log("=> Data written to " + path, "blue")

    return data
}
