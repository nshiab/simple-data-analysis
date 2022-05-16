import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types.js"
import { extent } from "d3-array"
import hasKey from "../helpers/hasKey.js"

export default function addBins(data: SimpleDataItem[], key: string, newKey: string, nbBins: number, options: Options): SimpleDataItem[] {

    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }
    if (hasKey(data[0], newKey)) {
        throw new Error("Already a key named " + key)
    }

    const values = data.map(d => d[key])
    const [min, max] = extent(values)
    const difference = max - min
    const interval = difference / nbBins

    const bins = []
    for (let i = 1; i <= nbBins; i++) {
        bins.push(min + i * interval)
    }

    options.logs && log("The bins values are => " + min + "," + String(bins), "blue")
    options.logs && log("/!\\ The first bin is labelled 1 (not 0).", "bgRed")

    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        for (let b = 1; b <= bins.length; b++) {
            if (value <= bins[b - 1]) {
                data[i][newKey] = b
                break
            }
        }
    }

    return data
}