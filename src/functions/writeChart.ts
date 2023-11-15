import { PlotOptions, plot } from "@observablehq/plot"
import setJSDom from "../helpers/setJSDom.js"
import { writeFileSync } from "fs"

export default function writeChart(file: string, plotOptions: PlotOptions) {
    setJSDom()
    const html = plot(plotOptions)
    const cleanHtml = html.outerHTML.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    )
    writeFileSync(file, cleanHtml)
}
