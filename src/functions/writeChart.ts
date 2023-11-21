import { PlotOptions, plot } from "@observablehq/plot"
import setJSDom from "../helpers/setJSDom.js"
import { writeFileSync } from "fs"

/**
 * Writes a chart to an SVG or HTML file using the Observable Plot library. This is meant to be used with NodeJS or similar JavaScript runtimes. It uses jsdom to emulate web APIs.
 *
 * ```ts
 * const data = await sdb.getChartData("tableA")
 *
 * writeChart("output/chart.svg", {
 *  marks: [
 *      Plot.dot(data, {
 *          x: "year",
 *          y: "price"
 *      })
 *  ]
 * })
 * ```
 *
 * @param file - The path to the file.
 * @param plotOptions - The Plot options for creating the chart.
 */

export default function writeChart(file: string, plotOptions: PlotOptions) {
    setJSDom()
    const html = plot(plotOptions)
    const cleanHtml = html.outerHTML.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    )
    writeFileSync(file, cleanHtml)
}
