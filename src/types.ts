import { checkEnvironment } from "./helpers/checkEnvironment.js"

export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date
}

export interface Options {
    logs: boolean,
    logOptions: boolean,
    nbItemInTable: number,
    fractionDigits: number,
    missingValues: any[]
}

export const defaultOptions: Options = {
    logs: checkEnvironment() === "nodejs",
    logOptions: false,
    nbItemInTable: 5,
    fractionDigits: 0,
    missingValues: [null, NaN, undefined, ""]
}