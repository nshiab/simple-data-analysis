import setJSDom from "../../helpers/setJSDom.js"
import { writeFileSync } from "fs"
import log from "../../helpers/log.js"
import getCustomChart from "./getCustomChart.js"

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
