import { SimpleDataItem, Options } from "../types.js"

export default function describe(data: SimpleDataItem[], options: Options): SimpleDataItem[] {

    const nbItems = data.length
    const nbKeys = Object.keys(data[0]).length
    const nbDataPoints = nbItems * nbKeys

    const dataDescription = {
        nbItems,
        nbKeys,
        nbDataPoints
    }

    return [dataDescription]
}