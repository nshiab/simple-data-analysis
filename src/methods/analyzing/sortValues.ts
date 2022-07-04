import { SimpleDataItem } from "../../types/SimpleData.types.js"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"

export default function sortValues(
    data: SimpleDataItem[],
    key: string,
    order: "ascending" | "descending",
    locale = "fr",
    nbTestedValue = 10000,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data[0], key)) {
        throw new Error("No key " + key)
    }

    if (checkTypeOfKey(data, key, "string", 0.5, nbTestedValue, verbose)) {
        if (order === "ascending") {
            data.sort((a, b) =>
                (a[key] as string).localeCompare(b[key] as string, locale)
            )
        } else {
            data.sort(
                (a, b) =>
                    (a[key] as string).localeCompare(b[key] as string, locale) *
                    -1
            )
        }
    } else {
        if (order === "ascending") {
            data.sort((a, b) =>
                (a[key] as number) < (b[key] as number) ? -1 : 1
            )
        } else {
            data.sort((a, b) =>
                (a[key] as number) < (b[key] as number) ? 1 : -1
            )
        }
    }

    return data
}
