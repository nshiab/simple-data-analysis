import log from "../helpers/log"
import { SimpleDataItem, Options } from "../types"
//@ts-ignore
import { quantile } from "d3-array"

export default function addQuantiles(data: SimpleDataItem[], key: string, newKey: string, nbQuantiles: number, options: Options): SimpleDataItem[] {

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }
    if (data[0].hasOwnProperty(newKey)) {
        throw new Error("Already a key named " + key)
    }

    const interval = 1 / nbQuantiles
    const values = data.map(d => d[key])
    const quantiles = []
    for (let i = 0; i < 1; i += interval) {
        //@ts-ignore
        quantiles.push(quantile(values, i))
    }

    options.logs && log("The quantiles values are => " + String(quantiles), "blue")

    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        let quantile = 1
        for (let q = 1; q <= quantiles.length; q++) {
            //@ts-ignore
            if (value < quantiles[q - 1]) {
                quantile = q
                break
            }
        }
        data[i][newKey] = quantile
    }

    return data
}