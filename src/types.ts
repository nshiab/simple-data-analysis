export interface SimpleDataItem {
    [key: string]: string | number | boolean | Date
}

export interface Options {
    logs: boolean
}

export const defaultOptions: Options = {
    logs: false
}