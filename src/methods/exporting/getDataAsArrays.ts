import { SimpleDataItem, SimpleDataValue } from "../../types/SimpleData.types";

export default function getDataAsArrays(data: SimpleDataItem[]) {

    const newData: { [key: string]: SimpleDataValue[] } = {}

    const keys = Object.keys(data[0])

    for (const key of keys) {
        newData[key] = data.map(d => d[key])
    }

    return newData
}