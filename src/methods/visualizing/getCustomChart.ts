import helpers from "../../helpers/index.js"

export default function getCustomChart(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plotOptions: { [key: string]: any }
): string {
    const chart = helpers.plotChart(plotOptions)

    return chart.html
}
