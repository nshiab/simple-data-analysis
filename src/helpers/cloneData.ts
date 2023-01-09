import { SimpleDataItem } from "../types/SimpleData.types"

export default function cloneData(data: SimpleDataItem[]) {
    return data.map((item) => ({ ...item }))
}
