import fs from "fs"
import log from "./log.js"

export default function writeChart(path: string, chart: string, verbose?: boolean): string {

    fs.writeFileSync(
        path,
        chart
    )

    verbose && log(`=> chart save to ${path}`, "blue")

    return chart

}