import { dataToArrays } from "journalism"
import SimpleTable from "../class/SimpleTable"
import getExtension from "./getExtension.js"
import { writeFileSync } from "fs"

export default async function writeDataAsArrays(
    simpleTable: SimpleTable,
    file: string
) {
    simpleTable.debug && console.log("\nwriteDataAsArrays")
    const fileExtension = getExtension(file)
    if (fileExtension === "json") {
        const data = await simpleTable.getData()
        writeFileSync(file, JSON.stringify(dataToArrays(data)))
    } else {
        throw new Error("The option dataAsArrays works only with json files.")
    }
    simpleTable.debug && console.log("Done.")
}
