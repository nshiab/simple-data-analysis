import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types"
import getChart from "./getChart.js"
import { writeFileSync } from "fs"
import setJSDom from "../../helpers/setJSDom.js"

export default function saveChart(
    data: SimpleDataItem[],
    path: string,
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
    smallMultipleKey?: string,
    smallMultipleWidth?: number,
    smallMultipleHeight?: number,
    verbose = false
) {
    setJSDom()

    const chart = getChart(
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
        title,
        smallMultipleKey,
        smallMultipleWidth,
        smallMultipleHeight
    )

    writeFileSync(path, chart)
    verbose && log(`=> Chart saved to ${path}`, "blue")
}