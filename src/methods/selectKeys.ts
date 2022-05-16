import { SimpleDataItem, Options } from "../types.js"

export default function selectKeys(data: SimpleDataItem[], keys: string[], options: Options): SimpleDataItem[] {

    const start = Date.now()

    for (let key of keys) {
        if (!data[0].hasOwnProperty(key)) {
            throw new Error("No key " + key)
        }
    }

    const selectedData = []

    for (let i = 0; i < data.length; i++) {
        let obj: SimpleDataItem = {}
        for (let key of keys) {
            obj[key] = data[i][key]
        }
        selectedData.push(obj)
    }

    return selectedData
}