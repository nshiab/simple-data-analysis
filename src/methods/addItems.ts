import { SimpleDataItem, Options } from "../types.js"
//@ts-ignore
import isEqual from "lodash.isequal"

export default function addItems(data: SimpleDataItem[], dataToBeAdded: SimpleDataItem[], options: Options): SimpleDataItem[] {

    let newData

    if (Array.isArray(dataToBeAdded) && typeof dataToBeAdded[0]) {
        // All items needs to have the same keys in all SimpleData elements
        const keys1 = Object.keys(data[0]).sort()
        const keys2 = Object.keys(dataToBeAdded[0]).sort()

        if (!isEqual(keys1, keys2)) {
            throw new Error(`data and dataToBeAdded don't have the same keys\ndata keys => ${String(keys1)}\ndataToBeAdded keys => ${String(keys2)}`)
        }

        newData = data.concat(dataToBeAdded)

    } else if (dataToBeAdded.constructor.name === "SimpleData") {

        //@ts-ignore
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

    return newData
}