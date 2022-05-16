import { SimpleDataItem, Options } from "../types.js"

export default function sortValues(data: SimpleDataItem[], key: string, order: "ascending" | "descending", options: Options): SimpleDataItem[] {

    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    if (order === "ascending") {
        data.sort((a, b) => a[key] < b[key] ? -1 : 1)
    } else {
        data.sort((a, b) => a[key] < b[key] ? 1 : -1)
    }

    return data
}