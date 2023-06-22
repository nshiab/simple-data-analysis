import { csvFormat } from "d3-dsv"
import { SimpleDataItem } from "../../types/SimpleData.types"

export default function getDataAsCSV(data: SimpleDataItem[]) {
    return csvFormat(data)
}
