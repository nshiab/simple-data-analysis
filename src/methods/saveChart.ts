import { Options, SimpleDataItem } from "../types/SimpleData.types.js"
import { dot, line, barY, boxY, plot } from "@observablehq/plot"
import getExtension from "../helpers/getExtension.js";
import getPlotHtmlAndWrite from "../helpers/getPlotHtmlAndWrite.js";

export default function saveChart(data: SimpleDataItem[], path: string, type: "dot" | "line" | "bar" | "box", x: any[], y: any[], color: string, options: Options): SimpleDataItem[] {

    const extension = getExtension(path)
    if (extension !== "html") {
        throw new Error("For the moment, you can only export charts with file extension .html")
    }

    const markOption: { [key: string]: any } = { x, y }

    if (color && ["dot", "bar", "box"].includes(type)) {
        markOption.fill = color
    } else if (color) {
        markOption.stroke = color
    }

    let mark
    if (type === "dot") {
        mark = dot(data, markOption)
    } else if (type === "line") {
        mark = line(data, markOption)
    } else if (type === "bar") {
        mark = barY(data, markOption)
    } else if (type === "box") {
        mark = boxY(data, markOption)
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

    getPlotHtmlAndWrite(plotOptions, path, options)

    return data
}