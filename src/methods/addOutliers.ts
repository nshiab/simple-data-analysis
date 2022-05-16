import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types.js"
//@ts-ignore
import { quantile, extent } from "d3-array"
import percentage from "../helpers/percentage.js"

export default function addOutliers(data: SimpleDataItem[], key: string, newKey: string, method: "boxplot", options: Options): SimpleDataItem[] {

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }
    if (data[0].hasOwnProperty(newKey)) {
        throw new Error("Already a key named " + key)
    }

    const values = data.map(d => d[key])
    //@ts-ignore
    const q1 = quantile(values, 0.25)
    //@ts-ignore
    const q3 = quantile(values, 0.75)
    //@ts-ignore
    const interQuartileRange = q3 - q1

    //@ts-ignore
    const upper = q3 + interQuartileRange * 1.5
    //@ts-ignore
    const lower = q1 - interQuartileRange * 1.5

    //@ts-ignore
    const [min, max] = extent(values)

    options.logs && log(`Min: ${min}, Lower threshold: ${lower}, Q1: ${q1}, Q3: ${q3}, Upper threshold: ${upper}, Max: ${max}`, "blue")

    let outliers = 0

    for (let i = 0; i < data.length; i++) {
        if (data[i][key] < lower || data[i][key] > upper) {
            data[i][newKey] = true
            outliers += 1
        } else {
            data[i][newKey] = false
        }
    }

    options.logs && log(`${outliers} outliers found, representing ${percentage(outliers, data.length, options)} of the incoming data.`, "blue")

    return data
}