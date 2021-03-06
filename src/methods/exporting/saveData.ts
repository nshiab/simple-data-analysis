import getExtension from "../../helpers/getExtension.js"
import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import fs from "fs"
import { parse } from "json2csv"
import getDataAsArrays from "./getDataAsArrays.js"

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
