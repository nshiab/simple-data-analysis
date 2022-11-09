import { SimpleDataItem, SimpleDataValue } from "../types/SimpleData.types"

export default function arraysToData(
    data: {
        [key: string]: SimpleDataValue[]
    },
    noTests: boolean
): SimpleDataItem[] {
    const keys = Object.keys(data)
    const nbItems = data[keys[0]].length

    if (!noTests) {
        for (let i = 1; i < keys.length; i++) {
            if (data[keys[i]].length !== nbItems) {
                throw new Error(
                    `Key ${keys[0]} has ${nbItems} items but key ${
                        keys[i]
                    } has ${
                        data[keys[i]].length
                    }. All keys must have the same number of values.`
                )
            }
        }
    }

    const newData = []
    for (let i = 0; i < nbItems; i++) {
        const newItem: { [key: string]: SimpleDataValue } = {}
        for (const key of keys) {
            newItem[key] = data[key][i]
        }
        newData.push(newItem)
    }

    return newData
}
