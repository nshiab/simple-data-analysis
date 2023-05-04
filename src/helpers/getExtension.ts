import { log } from "../exports/helpers.js"

export default function getExtension(path: string, verbose: boolean) {
    const extensionSplit = path.split(".")
    const extension =
        extensionSplit[extensionSplit.length - 1].toLocaleLowerCase()

    verbose && log("Detected " + extension + " file extension", "blue")

    return extension
}
