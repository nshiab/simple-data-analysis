import checkEnvironment from "./helpers/checkEnvironment.js"

export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date
}

export interface Options {
    encoding: BufferEncoding,
    logs: boolean,
    logOptions: boolean,
    logParameters: boolean,
    nbItemInTable: "all" | number,
    fractionDigits: number,
    missingValues: object[],
    missingValuesArray: any[],
    nbValuesTestedForTypeOf: 100,
    environment: string,
    showDataNoOverwrite: boolean
}

export const defaultOptions: Options = {
    encoding: "utf-8",
    logs: false,
    logOptions: false,
    logParameters: false,
    nbItemInTable: 5,
    fractionDigits: 1,
    //@ts-ignore
    missingValues: { "null": null, "NaN": NaN, "undefined": undefined },
    missingValuesArray: [null, NaN, undefined, ""],
    nbValuesTestedForTypeOf: 100,
    environment: checkEnvironment(),
    showDataNoOverwrite: false
}