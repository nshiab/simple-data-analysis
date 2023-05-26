import { SimpleDataItem } from "../types/SimpleData.types"

export default function addFileNameAsValue(
    path: string,
    data: SimpleDataItem[]
) {
    const filePathSplit = path.split("/")
    const fileName = filePathSplit[filePathSplit.length - 1]
    for (let i = 0; i < data.length; i++) {
        data[i].file = fileName
    }
    return data
}
