import log from "../helpers/log"
import { SimpleDataItem, Options, defaultOptions } from "../types"
import showTable from "./showTable"
import SimpleData from "../class/SimpleData"
import checkTypeOfKey from "../helpers/checkTypeOfKey"
import percentage from "../helpers/percentage"

export default function mergeItems(data: SimpleDataItem[], dataToBeMerged: SimpleDataItem[], commonKey: string, options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nmergeItems() " + commonKey)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    let newData

    if (dataToBeMerged instanceof SimpleData) {
        newData = dataToBeMerged.data
    } else {
        newData = dataToBeMerged
    }

    // All items needs to have the same keys
    if (!newData[0].hasOwnProperty(commonKey)) {
        throw new Error("No key named " + commonKey + " in data")
    }
    if (!newData[0].hasOwnProperty(commonKey)) {
        throw new Error("No key named " + commonKey + " in dataToBeMerged")
    }

    const dataKeys = Object.keys(data[0]).filter(d => d !== commonKey)
    const newDataKeys = Object.keys(newData[0]).filter(d => d !== commonKey)

    for (let key of dataKeys) {
        for (let newKey of newDataKeys) {
            if (newKey === key) {
                throw new Error("Key " + key + " is present in data and in dataToBeMerged. Rename it in data or dataToBeMerged")
            }
        }
    }

    if (!checkTypeOfKey(data, commonKey, "string", 1, options)) {
        throw new Error("At least one value of " + commonKey + " in data is not string. To avoid problems, ids should always be string. Convert them with valuesToString()")
    } else if (!checkTypeOfKey(newData, commonKey, "string", 1, options)) {
        throw new Error("At least one value of " + commonKey + " in dataToBeMerged is not string. To avoid problems, ids should always be string. Convert them with valuesToString()")
    }

    // Using code from here : http://learnjsdata.com/combine_data.html

    // m for mainTable, l for lookupTable
    const m = data.length
    const l = newData.length

    if (m < l) {
        throw new Error("Data has less items than dataToBeMerged.")
    }

    const emptyItem = {}
    for (let i = 0; i < newDataKeys.length; i++) {
        //@ts-ignore
        emptyItem[newDataKeys[i]] = undefined
    }
    const lookupIndex: any[] = []
    const mergedData = []

    for (let i = 0; i < l; i++) {
        const row = newData[i]
        //@ts-ignore
        lookupIndex[row[commonKey]] = row
    }

    let nbUndefined = 0
    for (let j = 0; j < m; j++) {
        let y = data[j]
        //@ts-ignore
        let x = lookupIndex[y[commonKey]]
        if (x === undefined) {
            mergedData.push({ ...y, ...emptyItem })
            nbUndefined += 1
        } else {
            mergedData.push({ ...y, ...x })
        }
    }

    options.logs && nbUndefined > 0 && log(`/!\\ Not match for ${nbUndefined} items, representing ${percentage(nbUndefined, data.length, options)} of items. New keys have undefined values for these items.`, "bgRed")
    options.logs && showTable(mergedData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return mergedData
}