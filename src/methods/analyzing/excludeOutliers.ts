import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { quantile, extent } from "d3-array"
import percentage from "../../helpers/percentage.js"
import hasKey from "../../helpers/hasKey.js"

export default function excludeOutliers(
    data: SimpleDataItem[],
    key: string,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    const values = data.map((d) => d[key]) as Iterable<number>
    const q1 = quantile(values, 0.25) as number
    const q3 = quantile(values, 0.75) as number
    const interQuartileRange = q3 - q1

    const upper = q3 + interQuartileRange * 1.5
    const lower = q1 - interQuartileRange * 1.5

    const [min, max] = extent(values)

    verbose &&
        log(
            `Min: ${min}, Lower threshold: ${lower}, Q1: ${q1}, Q3: ${q3}, Upper threshold: ${upper}, Max: ${max}`,
            "blue"
        )

    const filteredData = data.filter(
        (d) => (d[key] as number) >= lower && (d[key] as number) <= upper
    )

    const outliers = data.length - filteredData.length
    verbose &&
        log(
            `/!\\ ${outliers} outliers found and excluded, representing ${percentage(
                outliers,
                data.length
            )} of the incoming data.`,
            "bgRed"
        )

    return filteredData
}
