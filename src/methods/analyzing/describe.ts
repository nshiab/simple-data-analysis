import { SimpleDataItem } from "../../types/SimpleData.types.js"

export default function describe(data: SimpleDataItem[]): SimpleDataItem[] {
    const nbItems = data.length
    const nbKeys = Object.keys(data[0]).length
    const nbDataPoints = nbItems * nbKeys

    const dataDescription = {
        nbItems,
        nbKeys,
        nbDataPoints,
    }

    return [dataDescription]
}
