import SimpleData from "../class/SimpleData.js"
import { SimpleDataItem } from "../types/SimpleData.types"

export default function createSimpleData(data: SimpleDataItem[]) {
    return new SimpleData(data)
}