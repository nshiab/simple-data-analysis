import { writeFileSync } from "fs"
import { log } from "../../exports/helpers.js"
import { setJSDom } from "../../exports/helpersNode.js"
import { getCustomChart } from "../../exports/visualizing.js"

export default function saveCustomChart(
    path: string,
    plotOptions: object,
    verbose = false
) {
    setJSDom()

    const chart = getCustomChart(plotOptions)

    writeFileSync(path, chart)
    verbose && log(`=> chart saved to ${path}`, "blue")
}
