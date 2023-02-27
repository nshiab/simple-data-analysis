import { SimpleDataItem } from "../../types/SimpleData.types.js"
import {
    frame as frameMark,
    dot,
    line,
    barY,
    barX,
    boxY,
    boxX,
    linearRegressionY,
} from "@observablehq/plot"
import plotChart from "../../helpers/plotChart.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import { regressionLinear } from "d3-regression"
import round from "../../helpers/round.js"
import log from "../../helpers/log.js"
import getUniqueValues from "../exporting/getUniqueValues.js"
import hasKey from "../../helpers/hasKey.js"

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
    colorScale?: "linear" | "diverging" | "categorical" | "ordinal",
    trend?: boolean,
    showTrendEquation?: boolean,
    marginLeft?: number,
    marginBottom?: number,
    width = 600,
    height = 450,
    title?: string,
    smallMultipleKey?: string,
    smallMultipleWidth?: number,
    smallMultipleHeight?: number
): string {
    if (typeof smallMultipleKey === "string") {
        if (!hasKey(data, smallMultipleKey)) {
            throw new Error(`No smallMultipleKey ${smallMultipleKey} in data.`)
        }

        const smallMultiple = getUniqueValues(data, smallMultipleKey)

        let multipleCharts = ""
        const gap = 10

        for (const multiple of smallMultiple) {
            if (typeof multiple !== "string") {
                throw new Error(
                    `Values of ${smallMultipleKey} must be strings.`
                )
            }

            multipleCharts += `<div>${renderChart(
                data.filter((d) => d[smallMultipleKey] === multiple),
                type,
                x,
                y,
                color,
                colorScale,
                trend,
                showTrendEquation,
                marginLeft,
                marginBottom,
                smallMultipleWidth ? smallMultipleWidth - gap : width - gap,
                smallMultipleHeight ? smallMultipleHeight : height,
                multiple,
                true
            )}</div>`
        }

        let titleHTML = ""
        if (title) {
            titleHTML = `<div style="font-family:system-ui, sans-serif;font-size:20px;font-weight: bold;margin-bottom: 8px;">${title}</div>`
        }

        return `<div style='width: ${width}px; height: auto;'>
                    <div>${titleHTML}</div>
                    <div style='display: flex; flex-wrap: wrap; gap: ${gap}px; width: ${width}px; height: auto;'>
                        ${multipleCharts}
                    </div>
        </div>`
    } else {
        return renderChart(
            data,
            type,
            x,
            y,
            color,
            colorScale,
            trend,
            showTrendEquation,
            marginLeft,
            marginBottom,
            width,
            height,
            title
        )
    }
}

function renderChart(
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
    colorScale?: "linear" | "diverging" | "categorical" | "ordinal",
    trend?: boolean,
    showTrendEquation?: boolean,
    marginLeft?: number,
    marginBottom?: number,
    width?: number,
    height?: number,
    title?: string,
    frame?: boolean
) {
    const markOption: { [key: string]: string | number } = { x, y }

    if (!hasKey(data, x)) {
        throw new Error(`No x key ${x} in data.`)
    }
    if (!hasKey(data, y)) {
        throw new Error(`No y key ${y} in data.`)
    }
    if (color && !hasKey(data, color)) {
        throw new Error(`No color key ${color} in data.`)
    }

    if (
        color &&
        [
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plotOptions: { [key: string]: any } = {
        color: { scheme: "viridis" },
        grid: true,
        marks: [mark],
    }

    if (width) {
        plotOptions.width = width
    }

    if (height) {
        plotOptions.height = height
    }

    if (trend) {
        plotOptions.marks.push(linearRegressionY(data, { x: x, y: y }))
    }

    if (frame) {
        plotOptions.marks.push(frameMark())
    }

    if (marginLeft) {
        plotOptions.marginLeft = marginLeft
    }
    if (marginBottom) {
        plotOptions.marginBottom = marginBottom
    }

    if (color && colorScale) {
        if (plotOptions.color) {
            plotOptions.color.type = colorScale
        } else {
            plotOptions.color = { type: colorScale }
        }
        if (colorScale === "diverging") {
            plotOptions.color.scheme = "BuRd"
        }
    }

    if (checkTypeOfKey(data, x, "string", 0.5, 100, false, true)) {
        if (type === "dot") {
            plotOptions.x = { type: "point" }
        } else if (type !== "line") {
            plotOptions.x = { type: "band" }
        }
    }
    if (checkTypeOfKey(data, y, "string", 0.5, 100, false, true)) {
        if (type === "dot") {
            plotOptions.y = { type: "point" }
        }
    }

    const chart = plotChart(plotOptions)
    const chartHTML = chart.html

    let titleHTML = ""
    if (title) {
        titleHTML = `<div style="font-family:system-ui, sans-serif;font-size:14px;font-weight: bold;">${title}</div>`
    }

    let legendHTML = ""
    if (color && ["line", "dot"].includes(type)) {
        let legend

        try {
            legend = chart.plt.legend("color").outerHTML
        } catch (err) {
            log(
                "You chart is supposed to have a legend, but it couldn't be rendered.",
                "blue"
            )
        }
        if (legend) {
            legendHTML =
                `<div style="width:${width ? width : 640}px;margin-top: ${
                    title ? 8 : 0
                }px;">` +
                legend +
                "</div>"
        }
    }

    let trendEquationHTML = ""
    if (showTrendEquation) {
        const linearRegression = regressionLinear()
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .x((d) => d[x])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .y((d) => d[y])(data)
        let nbDigits = 0

        while (
            nbDigits < 10 &&
            (Math.abs(linearRegression.a) < 1 / Math.pow(10, nbDigits) ||
                Math.abs(linearRegression.b) < 1 / Math.pow(10, nbDigits))
        ) {
            nbDigits += 1
        }

        trendEquationHTML = `<div style='width: 100%; max-width: ${
            width ? width - 20 : 620
        }px;font-family:system-ui, sans-serif;font-size:10px;text-align:right;'><div>y = ${round(
            linearRegression.a,
            nbDigits + 1
        )}x + ${round(
            linearRegression.b,
            nbDigits + 1
        )} , R<sup>2</sup>: ${round(linearRegression.rSquared, 2)}</div></div>`
    }

    return (
        "<div>" +
        titleHTML +
        legendHTML +
        trendEquationHTML +
        chartHTML +
        "</div>"
    )
}
