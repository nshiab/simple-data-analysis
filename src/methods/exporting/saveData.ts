import getExtension from "../../helpers/getExtension.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import fs from "fs"
import { parse } from "json2csv"
import { log } from "../../exports/helpers.js"
import { getDataAsArrays } from "../../exports/exporting.js"

export default async function saveData(
    data: SimpleDataItem[],
    path: string,
    dataAsArrays: boolean,
    encoding: BufferEncoding,
    verbose: boolean
) {
    const extension = getExtension(path, verbose)

    if (extension === "csv") {
        const csvString = parse(data)

        fs.writeFileSync(path, csvString, { encoding: encoding })
    } else if (extension === "json") {
        if (dataAsArrays) {
            verbose && log("=> data as arrays", "blue")
            fs.writeFileSync(path, JSON.stringify(getDataAsArrays(data)), {
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
