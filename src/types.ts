import { checkEnvironment } from "./helpers/checkEnvironment.js"

export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date
}

export interface Options {
    encoding: BufferEncoding,
    logs: boolean,
    logOptions: boolean,
    nbItemInTable: "all" | number,
    fractionDigits: number,
    missingValues: any[]
}

export const defaultOptions: Options = {
    encoding: "utf-8",
    logs: false,
    logOptions: false,
    nbItemInTable: 5,
    fractionDigits: 0,
    missingValues: [null, NaN, undefined, ""]
}