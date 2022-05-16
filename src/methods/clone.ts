import { SimpleDataItem, Options } from "../types"
import cloneDeep from "lodash.clonedeep"
import SimpleData from "../class/SimpleData"

export default function clone(data: SimpleDataItem[], defaultOptions: Options, options: Options): object {

    const clonedData = cloneDeep(data)
    const newSimpleData = new SimpleData(clonedData, defaultOptions)

    return newSimpleData
}