import log from "./log.js"
import { plot } from "@observablehq/plot"

export default function plotChart(plotOptions: { [key: string]: any }, verbose?: boolean): string {

    verbose && log(plotOptions)

    const outerHTML = plot(plotOptions).outerHTML
    const chart = outerHTML
        .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"')

    return chart
}