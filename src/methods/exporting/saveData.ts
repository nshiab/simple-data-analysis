import fs from "fs"
import { parse } from "json2csv"

import { SimpleDataItem } from "../../types/index.js"
import helpers from "../../helpers/index.js"
import exporting from "./index.js"

export default async function saveData(
    data: SimpleDataItem[],
    path: string,
    dataAsArrays: boolean,
    verbose: boolean,
    encoding: BufferEncoding
) {
    const extension = helpers.getExtension(path)

    if (extension === "csv") {
        verbose && helpers.log("=> Csv file extension detected", "blue")
        const csvString = parse(data)

        fs.writeFileSync(path, csvString, { encoding: encoding })
    } else if (extension === "json") {
        verbose &&
            helpers.log("=> " + extension + " file extension detected", "blue")
        if (dataAsArrays) {
            verbose && helpers.log("=> data as arrays", "blue")
            fs.writeFileSync(
                path,
                JSON.stringify(exporting.getDataAsArrays_(data)),
                {
                    encoding: encoding,
                }
            )
        } else {
            fs.writeFileSync(path, JSON.stringify(data), { encoding: encoding })
        }
    } else {
        throw new Error("Unknow file extension")
    }

    verbose && helpers.log("=> Data written to " + path, "blue")

    return data
}
