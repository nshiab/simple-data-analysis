import plotChart from "../../helpers/plotChart.js"

export default function getCustomChart(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plotOptions: { [key: string]: any },
    verbose?: boolean
): string {
    const chart = plotChart(plotOptions, verbose)

    return chart
}
