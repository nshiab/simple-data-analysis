export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date
}

export interface Options {
    logs: boolean,
    nbItemInTable: number
}

export const defaultOptions: Options = {
    logs: false,
    nbItemInTable: 5
}