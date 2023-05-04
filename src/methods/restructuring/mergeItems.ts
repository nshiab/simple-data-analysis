import SimpleData from "../../class/SimpleData.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import {
    hasKey,
    log,
    checkTypeOfKey,
    toPercentage,
} from "../../exports/helpers.js"

export default function mergeItems(
    data: SimpleDataItem[],
    dataToBeMerged: SimpleDataItem[] | SimpleData,
    commonKey: string,
    verbose = false,
    nbValuesTested = 10000
): SimpleDataItem[] {
    verbose && log("\nmergeItems() " + commonKey)

    if (commonKey === undefined) {
        throw new Error("You must provide a common key to merge items.")
    }

    let newData

    if (dataToBeMerged instanceof SimpleData) {
        newData = dataToBeMerged.getData()
    } else {
        newData = dataToBeMerged
    }

    hasKey(data, commonKey)
    hasKey(newData, commonKey)

    const dataKeys: string[] = Object.keys(data[0]).filter(
        (d) => d !== commonKey
    )
    const newDataKeys: string[] = Object.keys(newData[0]).filter(
        (d) => d !== commonKey
    )

    for (const key of dataKeys) {
        for (const newKey of newDataKeys) {
            if (newKey === key) {
                throw new Error(
                    "Key " +
                        key +
                        " is present in data and in dataToBeMerged. Rename it in data or dataToBeMerged"
                )
            }
        }
    }

    if (
        !checkTypeOfKey(
            data,
            commonKey,
            "string",
            1,
            nbValuesTested,
            verbose,
            true
        )
    ) {
        throw new Error(
            "At least one value of " +
                commonKey +
                " in data is not string. To avoid problems, ids should always be string. Convert them with valuesToString()"
        )
    } else if (
        !checkTypeOfKey(
            newData,
            commonKey,
            "string",
            1,
            nbValuesTested,
            verbose,
            true
        )
    ) {
        throw new Error(
            "At least one value of " +
                commonKey +
                " in dataToBeMerged is not string. To avoid problems, ids should always be string. Convert them with valuesToString()"
        )
    }

    // Using code from here : http://learnjsdata.com/combine_data.html

    // m for mainTable, l for lookupTable
    const m = data.length
    const l = newData.length

    if (m < l) {
        throw new Error("Data has less items than dataToBeMerged.")
    }

    const emptyItem: { [key: string]: undefined } = {}
    for (let i = 0; i < newDataKeys.length; i++) {
        emptyItem[newDataKeys[i]] = undefined
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lookupIndex: any[] = []
    const mergedData = []

    for (let i = 0; i < l; i++) {
        const row = newData[i]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lookupIndex[row[commonKey] as any] = row
    }

    let nbUndefined = 0
    for (let j = 0; j < m; j++) {
        const y = data[j]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const x = lookupIndex[y[commonKey] as any]
        if (x === undefined) {
            mergedData.push({ ...y, ...emptyItem })
            nbUndefined += 1
        } else {
            mergedData.push({ ...y, ...x })
        }
    }

    verbose &&
        nbUndefined > 0 &&
        log(
            `/!\\ Not match for ${nbUndefined} items, representing ${toPercentage(
                nbUndefined,
                data.length
            )} of items. New keys have undefined values for these items.`,
            "bgRed"
        )

    return mergedData
}
