import { SimpleDataItem, Options } from "../types/SimpleData.types.js"
import isEqual from "lodash.isequal"
import log from "../helpers/log.js"
import SimpleData from "../class/SimpleData.js"

export default function addItems(data: SimpleDataItem[], dataToBeAdded: SimpleDataItem[], options: Options): SimpleDataItem[] {

    let newData

    if (Array.isArray(dataToBeAdded) && typeof dataToBeAdded[0]) {
        const keys1 = Object.keys(data[0]).sort()
        const keys2 = Object.keys(dataToBeAdded[0]).sort()

        if (!isEqual(keys1, keys2)) {
            throw new Error(`data and dataToBeAdded don't have the same keys\ndata keys => ${String(keys1)}\ndataToBeAdded keys => ${String(keys2)}`)
        }

        newData = data.concat(dataToBeAdded)

    } else if (dataToBeAdded instanceof SimpleData) {

        const dataTBA = dataToBeAdded.data

        const keys1 = Object.keys(data[0]).sort()
        const keys2 = Object.keys(dataTBA[0]).sort()

        if (!isEqual(keys1, keys2)) {
            throw new Error(`data and dataToBeAdded don't have the same keys\ndata keys => ${String(keys1)}\ndataToBeAdded keys => ${String(keys2)}`)
        }

        newData = data.concat(dataTBA)

    } else {
        throw Error("dataToBeAdded needs to be an array of objects or a SimpleData prototype")
    }

    options.logs && log(`/!\\ ${newData.length - data.length} items added. Number of items increased by ${((newData.length - data.length) / data.length * 100).toFixed(options.fractionDigits)}%`, "bgRed")

    return newData
}