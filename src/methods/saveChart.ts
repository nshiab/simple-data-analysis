import { Options, SimpleDataItem } from "../types/SimpleData.types.js"
import * as Plot from "@observablehq/plot"
import { JSDOM } from "jsdom"
import fs from "fs"
import log from "../helpers/log.js";

export default function saveChart(data: SimpleDataItem[], path: string, type: "dot" | "line" | "bar" | "box", x: any[], y: any[], color: string, options: Options): SimpleDataItem[] {

    const extensionSplit = path.split(".")
    const extension = extensionSplit[extensionSplit.length - 1].toLocaleLowerCase()
    if (extension !== "html") {
        throw new Error("For the moment, you can only export charts with file extension .html")
    }

    if (global.document === undefined) {
        const jsdom = new JSDOM("")
        global.document = jsdom.window.document
    }
    const markOption: { [key: string]: any } = { x, y }

    if (color && ["dot", "bar", "box"].includes(type)) {
        markOption.fill = color
    } else if (color) {
        markOption.stroke = color
    }

    let mark
    if (type === "dot") {
        mark = Plot.dot(data, markOption)
    } else if (type === "line") {
        mark = Plot.line(data, markOption)
    } else if (type === "bar") {
        mark = Plot.barY(data, markOption)
    } else if (type === "box") {
        mark = Plot.boxY(data, markOption)
    } else {
        throw new Error("Unknown chart type.")
    }

    const plotOptions: { [key: string]: any } = {
        grid: true,
        marks: [mark]
    }

    if (color && ["line", "dot"].includes(type)) {
        plotOptions.color = {
            legend: true
        }
    }

    options.logs && log(plotOptions)

    const plot = Plot.plot(plotOptions).outerHTML

    fs.writeFileSync(
        path,
        plot.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')
    )

    return data
}