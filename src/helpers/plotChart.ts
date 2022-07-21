import { plot } from "@observablehq/plot"

export default function plotChart(plotOptions: { [key: string]: object }) {
    const plt = plot(plotOptions)
    const html = plt.outerHTML.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    )

    return { plt, html }
}
