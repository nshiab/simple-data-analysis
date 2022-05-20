import { SimpleDataItem } from "../types/SimpleData.types.js"
import { dot, line, barY, boxY } from "@observablehq/plot"
import plotChart from "../helpers/plotChart.js"

export default function getChart(
    data: SimpleDataItem[],
    type: "dot" | "line" | "bar" | "box",
    x: string,
    y: string,
    color?: string,
    verbose?: boolean
): string {
    const markOption: { [key: string]: string } = { x, y }

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
        marks: [mark],
    }

    if (color && ["line", "dot"].includes(type)) {
        plotOptions.color = {
            legend: true,
        }
    }

    const chart = plotChart(plotOptions, verbose)

    return chart
}
