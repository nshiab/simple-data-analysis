import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { dot, line, barY, barX, boxY, boxX } from "@observablehq/plot"
import plotChart from "../../helpers/plotChart.js"

export default function getChart(
    data: SimpleDataItem[],
    type:
        | "dot"
        | "line"
        | "bar"
        | "barVertical"
        | "barHorizontal"
        | "box"
        | "boxVertical"
        | "boxHorizontal",
    x: string,
    y: string,
    color?: string,
    verbose?: boolean,
    marginLeft?: number,
    marginBottom?: number
): string {
    const markOption: { [key: string]: string | number } = { x, y }

    if (
        color &&
        [
            "dot",
            "bar",
            "barVertical",
            "barHorizontal",
            "box",
            "boxVertical",
            "boxHorizontal",
        ].includes(type)
    ) {
        markOption.fill = color
    } else if (color) {
        markOption.stroke = color
    }

    let mark
    if (type === "dot") {
        mark = dot(data, markOption)
    } else if (type === "line") {
        mark = line(data, markOption)
    } else if (type === "bar" || type === "barVertical") {
        mark = barY(data, markOption)
    } else if (type === "barHorizontal") {
        mark = barX(data, markOption)
    } else if (type === "box" || type === "boxVertical") {
        mark = boxY(data, markOption)
    } else if (type === "boxHorizontal") {
        mark = boxX(data, markOption)
    } else {
        throw new Error("Unknown chart type.")
    }

    const plotOptions: { [key: string]: any } = {
        grid: true,
        marks: [mark],
    }

    if (marginLeft) {
        plotOptions.marginLeft = marginLeft
    }
    if (marginBottom) {
        plotOptions.marginBottom = marginBottom
    }

    if (color && ["line", "dot"].includes(type)) {
        plotOptions.color = {
            legend: true,
        }
    }

    const chart = plotChart(plotOptions, verbose)

    return chart
}
