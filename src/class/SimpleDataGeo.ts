import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"
import SimpleData from "./SimpleData.js"

export default class SimpleDataGeo extends SimpleData {
    // If modified, might need to be modified in SimpleData too
    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
    }

    constructor({
        data = [],
        dataAsArrays = false,
        verbose = false,
        noTests = false,
        logParameters = false,
        nbTableItemsToLog = 5,
        fillMissingKeys = false,
        noLogs = false,
        firstItem = 0,
        lastItem = Infinity,
        duration = 0,
    }: {
        data?: SimpleDataItem[] | { [key: string]: SimpleDataValue[] }
        dataAsArrays?: boolean
        verbose?: boolean
        noTests?: boolean
        logParameters?: boolean
        nbTableItemsToLog?: number
        fillMissingKeys?: boolean
        noLogs?: boolean
        firstItem?: number
        lastItem?: number
        duration?: 0
    } = {}) {
        super({
            data,
            dataAsArrays,
            verbose,
            noTests,
            logParameters,
            nbTableItemsToLog,
            fillMissingKeys,
            noLogs,
            firstItem,
            lastItem,
            duration,
        })
    }
}
