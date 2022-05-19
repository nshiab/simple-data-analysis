import { SimpleDataItem } from "../types/SimpleData.types.js"

export default function showTable(data: SimpleDataItem[], nbItemInTable: number | "all") {

    console.log(data)

    console.table(
        nbItemInTable === "all" ?
            data :
            data.slice(0, nbItemInTable)
    )

    typeof nbItemInTable === "number" && data.length - nbItemInTable > 0 ?
        console.log(`... and ${data.length - nbItemInTable} more items (total of ${data.length})`) :
        console.log(`Total of ${data.length} items`)

    return data

}