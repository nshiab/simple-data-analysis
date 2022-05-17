import { Options, SimpleDataItem } from "../types/SimpleData.types.js"
import { JSDOM } from "jsdom"
import fs from "fs"

export default function saveCustomChart(data: SimpleDataItem[], path: string, observablePlot: any, options: Options): SimpleDataItem[] {

    console.log(data, observablePlot, path)

    const extensionSplit = path.split(".")
    const extension = extensionSplit[extensionSplit.length - 1].toLocaleLowerCase()
    if (extension !== "html") {
        throw new Error("For the moment, you can only export charts with file extension .html")
    }

    if (global.document === undefined) {
        const jsdom = new JSDOM("")
        global.document = jsdom.window.document
    }

    const plot = observablePlot.outerHTML

    fs.writeFileSync(
        path,
        plot.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')
    )

    return data
}