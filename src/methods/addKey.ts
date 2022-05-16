import { SimpleDataItem, Options } from "../types.js"

export default function addKey(data: SimpleDataItem[], key: string, func: Function, options: Options): SimpleDataItem[] {

    if (data[0].hasOwnProperty(key)) {
        throw new Error("Already a key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = func(data[i])
    }

    return data
}