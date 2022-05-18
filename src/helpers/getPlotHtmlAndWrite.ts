import { JSDOM } from "jsdom"
import fs from "fs"
import { Options } from "../types/SimpleData.types.js"
import log from "./log.js"
import { plot } from "@observablehq/plot"

export default function getPlotHtmlAndWrite(plotOptions: any, path: string, options: Options) {

    options.logs && log(plotOptions)

    if (global.document === undefined) {
        const jsdom = new JSDOM("")
        global.document = jsdom.window.document
    }

    const outerHTML = plot(plotOptions).outerHTML
    const chart = outerHTML
        .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')

    fs.writeFileSync(
        path,
        chart
    )

    options.logs && log(`=> chart save to ${path}`, "blue")

    return chart

}