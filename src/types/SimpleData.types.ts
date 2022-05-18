import checkEnvironment from "../helpers/checkEnvironment.js"

export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date | null | undefined
}

export interface Options {
    encoding: BufferEncoding,
    logs: boolean,
    logOptions: boolean,
    logParameters: boolean,
    nbItemInTable: "all" | number,
    fractionDigits: number,
    missingValues: { [key: string]: any },
    missingValuesArray: any[],
    nbValuesTestedForTypeOf: number,
    environment: string,
    showDataNoOverwrite: boolean
}

export interface partialOptions {
    encoding?: BufferEncoding,
    logs?: boolean,
    logOptions?: boolean,
    logParameters?: boolean,
    nbItemInTable?: "all" | number,
    fractionDigits?: number,
    missingValues?: { [key: string]: any },
    missingValuesArray?: any[],
    nbValuesTestedForTypeOf?: number,
    environment?: string,
    showDataNoOverwrite?: boolean
}

export const defaultOptions: Options = {
    encoding: "utf-8",
    logs: false,
    logOptions: false,
    logParameters: false,
    nbItemInTable: 5,
    fractionDigits: 1,
    missingValues: { "null": null, "NaN": NaN, "undefined": undefined },
    missingValuesArray: [null, NaN, undefined, ""],
    nbValuesTestedForTypeOf: 1000,
    environment: checkEnvironment(),
    showDataNoOverwrite: false
}