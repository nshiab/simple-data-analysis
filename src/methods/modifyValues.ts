import { SimpleDataItem, Options } from "../types"

export default function modifyValues(data: SimpleDataItem[], key: string, func: Function, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = func(data[i][key])
    }

    return data
}