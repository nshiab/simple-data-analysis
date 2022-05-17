import getExtension from "../helpers/getExtension.js"
import fs from "fs"
import { Options } from "../types/SimpleData.types"
import log from "../helpers/log.js"

export default function saveDocument(components: any[], path: string) {

    const extension = getExtension(path)
    if (!["html", "js"].includes(extension)) {
        throw new Error("Your analysis must be saved into an html or js file.")
    }

    const string = components.join("")

    fs.writeFileSync(path, string)

    log(`=> Document saved to ${path}`, "blue")
}