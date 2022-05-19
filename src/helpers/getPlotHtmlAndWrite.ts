import { JSDOM } from "jsdom"
import fs from "fs"
import log from "./log.js"
import { plot } from "@observablehq/plot"

export default function getPlotHtmlAndWrite(plotOptions: any, path: string, verbose?: boolean) {

    verbose && log(plotOptions)

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

    verbose && log(`=> chart save to ${path}`, "blue")

    return chart

}