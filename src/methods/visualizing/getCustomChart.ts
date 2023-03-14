import { plotChart } from "../../exports/helpers.js"

export default function getCustomChart(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plotOptions: { [key: string]: any }
): string {
    const chart = plotChart(plotOptions)

    return chart.html
}
