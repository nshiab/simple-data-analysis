import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { ascending, descending, Primitive } from "d3-array"
import { hasKey } from "../../exports/helpers.js"

export default function sortValues(
    data: SimpleDataItem[],
    key: string | string[],
    order: "ascending" | "descending",
    locale?: string | (string | undefined | null | boolean)[]
): SimpleDataItem[] {
    let keysToSort
    if (typeof key === "string") {
        keysToSort = [key]
    } else if (Array.isArray(key)) {
        keysToSort = key
    } else {
        throw new Error("key must be a string or an array of strings.")
    }

    let locales: (string | undefined | null | boolean)[] = []
    if (locale) {
        if (typeof locale === "string") {
            locales = [locale]
        } else if (Array.isArray(locale)) {
            locales = locale
        }
    }

    for (const key of keysToSort) {
        hasKey(data, key)
    }

    if (order === "ascending") {
        for (let i = keysToSort.length - 1; i >= 0; i--) {
            const key = keysToSort[i]
            const locale = locales[i]
            if (typeof locale === "string") {
                data.sort((a, b) =>
                    (a[key] as string).localeCompare(b[key] as string, locale)
                )
            } else {
                data.sort((a, b) =>
                    ascending(a[key] as Primitive, b[key] as Primitive)
                )
            }
        }
    } else if (order === "descending") {
        for (let i = keysToSort.length - 1; i >= 0; i--) {
            const key = keysToSort[i]
            const locale = locales[i]
            if (typeof locale === "string") {
                data.sort((a, b) =>
                    (b[key] as string).localeCompare(a[key] as string, locale)
                )
            } else {
                data.sort((a, b) =>
                    descending(a[key] as Primitive, b[key] as Primitive)
                )
            }
        }
    } else {
        throw new Error("The order must be either ascending or descending.")
    }

    return data
}
