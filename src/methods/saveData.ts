import getExtension from "../helpers/getExtension.js"
import log from "../helpers/log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"

export default async function saveData(
    data: SimpleDataItem[], 
    path: string, 
    verbose: boolean, 
    encoding: BufferEncoding, 
    environment: string
) {
    if (environment === "nodejs") {

        const fs = await import("fs")

        const extension = getExtension(path)

        if (extension === "csv") {

            const Papa = (await import("papaparse")).default

            verbose && log("=> Csv file extension detected", "blue")
            const csvString = Papa.unparse(data)

            fs.writeFileSync(path, csvString, { encoding: encoding })

        } else if (extension === "json") {

            verbose && log("=> " + extension + " file extension detected", "blue")
            fs.writeFileSync(path, JSON.stringify(data), { encoding: encoding })

        } else {

            throw new Error("Unknow file extension")

        }

    } else {
        throw new Error("Can't create a file locally from the browser")
    }

    verbose && log("=> Data written to " + path, "blue")

    return data

}