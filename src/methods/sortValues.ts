import { SimpleDataItem } from "../types/SimpleData.types.js"
import hasKey from "../helpers/hasKey.js"

export default function sortValues(
    data: SimpleDataItem[],
    key: string,
    order: "ascending" | "descending"
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (order === "ascending") {
        data.sort((a, b) => ((a[key] as number) < (b[key] as number) ? -1 : 1))
    } else {
        data.sort((a, b) => ((a[key] as number) < (b[key] as number) ? 1 : -1))
    }

    return data
}
