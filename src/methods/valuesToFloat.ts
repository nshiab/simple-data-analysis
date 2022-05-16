import { SimpleDataItem, Options } from "../types"

export default function valuesToFloat(data: SimpleDataItem[], key: string, options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    for (let i = 0; i < data.length; i++) {
        //@ts-ignore
        data[i][key] = parseFloat(data[i][key])
    }

    return data
}