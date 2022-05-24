import plotChart from "../../helpers/plotChart.js"

export default function getCustomChart(
    plotOptions: { [key: string]: any },
    verbose?: boolean
): string {
    const chart = plotChart(plotOptions, verbose)

    return chart
}
