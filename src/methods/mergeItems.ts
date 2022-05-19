import log from "../helpers/log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"
import SimpleData from "../class/SimpleData.js"
import checkTypeOfKey from "../helpers/checkTypeOfKey.js"
import percentage from "../helpers/percentage.js"
import hasKey from "../helpers/hasKey.js"

export default function mergeItems(data: SimpleDataItem[], dataToBeMerged: SimpleDataItem[] | SimpleData, commonKey: string, verbose: boolean, nbValuesTested: number): SimpleDataItem[] {


    verbose && log("\nmergeItems() " + commonKey)

    let newData

    if (dataToBeMerged instanceof SimpleData) {
        newData = dataToBeMerged.data
    } else {
        newData = dataToBeMerged
    }

    if (!hasKey(data[0], commonKey)) {
        throw new Error("No key named " + commonKey + " in data")
    }
    if (!hasKey(newData[0], commonKey)) {
        throw new Error("No key named " + commonKey + " in dataToBeMerged")
    }

    const dataKeys: string[] = Object.keys(data[0]).filter(d => d !== commonKey)
    const newDataKeys: string[] = Object.keys(newData[0]).filter(d => d !== commonKey)

    for (const key of dataKeys) {
        for (const newKey of newDataKeys) {
            if (newKey === key) {
                throw new Error("Key " + key + " is present in data and in dataToBeMerged. Rename it in data or dataToBeMerged")
            }
        }
    }

    if (!checkTypeOfKey(data, commonKey, "string", 1, verbose, nbValuesTested)) {
        throw new Error("At least one value of " + commonKey + " in data is not string. To avoid problems, ids should always be string. Convert them with valuesToString()")
    } else if (!checkTypeOfKey(newData, commonKey, "string", 1, verbose, nbValuesTested)) {
        throw new Error("At least one value of " + commonKey + " in dataToBeMerged is not string. To avoid problems, ids should always be string. Convert them with valuesToString()")
    }

    // Using code from here : http://learnjsdata.com/combine_data.html

    // m for mainTable, l for lookupTable
    const m = data.length
    const l = newData.length

    if (m < l) {
        throw new Error("Data has less items than dataToBeMerged.")
    }

    const emptyItem: { [key: string]: any } = {}
    for (let i = 0; i < newDataKeys.length; i++) {
        emptyItem[newDataKeys[i]] = undefined
    }
    const lookupIndex: SimpleDataItem[] = []
    const mergedData = []

    for (let i = 0; i < l; i++) {
        const row = newData[i]
        lookupIndex[row[commonKey] as any] = row
    }

    let nbUndefined = 0
    for (let j = 0; j < m; j++) {
        const y = data[j]
        const x = lookupIndex[y[commonKey] as any]
        if (x === undefined) {
            mergedData.push({ ...y, ...emptyItem })
            nbUndefined += 1
        } else {
            mergedData.push({ ...y, ...x })
        }
    }

    verbose && nbUndefined > 0 && log(`/!\\ Not match for ${nbUndefined} items, representing ${percentage(nbUndefined, data.length)} of items. New keys have undefined values for these items.`, "bgRed")


    return mergedData
}